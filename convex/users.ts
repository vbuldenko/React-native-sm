import { Id } from "./_generated/dataModel";
import { mutation, QueryCtx, MutationCtx, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

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

export const isFollowing = query({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const following = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    return !!following;
  },
});

export const toggleFollow = mutation({
  args: {
    followingId: v.id("users"),
  },
  handler: async (ctx, { followingId }) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const following = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", followingId)
      )
      .first();

    if (following) {
      await ctx.db.delete(following._id);
      await updateFollowStats(ctx, currentUser._id, followingId, false);
    } else {
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId,
      });
      await updateFollowStats(ctx, currentUser._id, followingId, true);

      await ctx.db.insert("notifications", {
        receiverId: followingId,
        senderId: currentUser._id,
        type: "follow",
      });
    }
  },
});

async function updateFollowStats(
  ctx: MutationCtx,
  userId: Id<"users">,
  followingUserId: Id<"users">,
  increment: boolean
) {
  const user = await ctx.db.get(userId);
  const followingUser = await ctx.db.get(followingUserId);

  if (user && followingUser) {
    await ctx.db.patch(userId, {
      following: user.following + (increment ? 1 : -1),
    });
    await ctx.db.patch(followingUserId, {
      followers: followingUser.followers + (increment ? 1 : -1),
    });
  }
}

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
