import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

// export const generateUploadUrl = mutation(async (ctx) => {
//   let identity;
//   try {
//     console.log("Calling getUserIdentity...");
//     identity = await ctx.auth.getUserIdentity();
//   } catch (error) {
//     throw new Error("Not authenticated");
//   }

//   if (!identity) {
//     throw new Error("Not authenticated");
//   }

//   return await ctx.storage.generateUploadUrl();
// });

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authorized");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) {
      throw new Error("User not found");
    }

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
