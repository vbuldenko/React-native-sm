import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx, MutationCtx, query } from "./_generated/server";
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

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
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

  return currentUser;
}

export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

export const updateProfile = mutation({
  args: {
    fullName: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const { fullName, bio } = args;

    await ctx.db.patch(currentUser._id, {
      fullName: args.fullName,
      bio: args.bio,
    });
  },
});

export type User = {
  _id: Id<"users">;
  _creationTime: number;
  bio?: string | undefined;
  image?: string | undefined;
  username: string;
  fullName: string;
  email: string;
  followers: number;
  following: number;
  posts: number;
  clerkId: string;
};
