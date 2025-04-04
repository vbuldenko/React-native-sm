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
    const post = await ctx.db.insert("posts", {
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

    return post;
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
