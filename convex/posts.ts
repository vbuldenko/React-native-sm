import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    try {
      console.log("Starting generateUploadUrl...");

      // Check authentication with proper error
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.log("No identity found");
        throw new ConvexError("UNAUTHENTICATED");
      }

      console.log("Identity found for user:", identity.subject);

      // Generate URL with explicit try/catch
      try {
        const url = await ctx.storage.generateUploadUrl();
        console.log("URL generated successfully");
        return url;
      } catch (storageError) {
        console.log("Storage error:", storageError);
        throw new ConvexError({
          message: "Failed to generate upload URL",
          code: "STORAGE_ERROR",
        });
      }
    } catch (error) {
      // Make sure error is properly propagated
      console.log("Error in generateUploadUrl:", error);
      if (error instanceof ConvexError) {
        throw error;
      }
      throw new ConvexError({
        message:
          error instanceof Error
            ? error.message
            : "Unknown error in generateUploadUrl",
        originalError:
          error instanceof Error ? error.toString() : String(error),
      });
    }
  },
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },

  handler: async (ctx, args) => {
    // Check authentication
    const currentUser = await getAuthenticatedUser(ctx);

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) {
      throw new Error("Image not found");
    }

    //Create post
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    // increment user posts count
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const getFeedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const posts = await ctx.db.query("posts").order("desc").collect();

    if (posts.length === 0) {
      return [];
    }

    // Get all posts extended with author and like/bookmark status
    const extendedPosts = await Promise.all(
      posts.map(async (post) => {
        const author = (await ctx.db.get(post.userId))!;

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        // const comments = await ctx.db
        //   .query("comments")
        //   .withIndex("by_post", (q) => q.eq("postId", post._id))
        //   .collect();

        // const isLiked = likes.some((like) => like.userId === currentUser._id);

        return {
          ...post,
          author,
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    );

    return extendedPosts;
  },
});

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (like) {
      await ctx.db.delete(like._id);
      await ctx.db.patch(args.postId, {
        likes: post.likes - 1,
      });

      return false;
    } else {
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, {
        likes: post.likes + 1,
      });

      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId: args.postId,
        });
      }

      return true;
    }
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },

  handler: async (ctx, args) => {
    // Check authentication
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);

    if (!post) throw new Error("Post not found");

    // Verify if the user is the owner of the post
    if (post.userId !== currentUser._id)
      throw new Error("Unauthorized for this action");

    // Delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // Delete associated bookmarks
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // Delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete associated notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // Delete the storage file
    await ctx.storage.delete(post.storageId);

    // Delete the post
    await ctx.db.delete(args.postId);

    // Decrement the user's posts count
    await ctx.db.patch(currentUser._id, {
      posts: Math.max((currentUser.posts || 1) - 1, 0),
    });
  },
});

export const getPostsByUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = args.userId
      ? await ctx.db.get(args.userId)
      : await getAuthenticatedUser(ctx);

    if (!user) throw new Error("User not found");

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId || user._id))
      .order("desc")
      .collect();

    if (posts.length === 0) {
      return [];
    }

    return posts;
  },
});
