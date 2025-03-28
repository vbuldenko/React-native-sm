import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    username: v.string(),
    fullName: v.string(),
    image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async ({ db, auth }, args) => {
    const { username, fullName, image, bio, email, clerkId } = args;

    const existingUser = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    await auth.getUserIdentity();

    if (existingUser) {
      return;
    }

    const user = await db.insert("users", {
      username,
      fullName,
      image,
      bio,
      email,
      clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});
