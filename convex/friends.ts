import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- Friend Requests ---

export const sendFriendRequest = mutation({
  args: {
    fromClerkId: v.string(),
    toClerkId: v.string(),
    fromName: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.fromClerkId === args.toClerkId) {
      throw new Error("Cannot friend yourself");
    }

    // Check if already friends
    const [low, high] = [args.fromClerkId, args.toClerkId].sort();
    const existing = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", low))
      .collect();
    if (existing.some((f) => f.user2 === high)) {
      throw new Error("Already friends");
    }

    // Check for existing pending request
    const pendingTo = await ctx.db
      .query("friendRequests")
      .withIndex("by_pair", (q) =>
        q.eq("fromClerkId", args.fromClerkId).eq("toClerkId", args.toClerkId),
      )
      .collect();
    if (pendingTo.some((r) => r.status === "pending")) {
      throw new Error("Request already sent");
    }

    // Check if they already sent us a request — auto-accept
    const pendingFrom = await ctx.db
      .query("friendRequests")
      .withIndex("by_pair", (q) =>
        q.eq("fromClerkId", args.toClerkId).eq("toClerkId", args.fromClerkId),
      )
      .collect();
    const pendingReverse = pendingFrom.find((r) => r.status === "pending");
    if (pendingReverse) {
      await ctx.db.patch(pendingReverse._id, { status: "accepted" });
      await ctx.db.insert("friends", {
        user1: low,
        user2: high,
        createdAt: Date.now(),
      });
      return { autoAccepted: true };
    }

    await ctx.db.insert("friendRequests", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return { autoAccepted: false };
  },
});

export const acceptFriendRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const req = await ctx.db.get(args.requestId);
    if (!req || req.status !== "pending") throw new Error("Invalid request");

    await ctx.db.patch(args.requestId, { status: "accepted" });

    const [low, high] = [req.fromClerkId, req.toClerkId].sort();
    await ctx.db.insert("friends", {
      user1: low,
      user2: high,
      createdAt: Date.now(),
    });
  },
});

export const declineFriendRequest = mutation({
  args: { requestId: v.id("friendRequests") },
  handler: async (ctx, args) => {
    const req = await ctx.db.get(args.requestId);
    if (!req || req.status !== "pending") throw new Error("Invalid request");
    await ctx.db.patch(args.requestId, { status: "declined" });
  },
});

export const removeFriend = mutation({
  args: { user1: v.string(), user2: v.string() },
  handler: async (ctx, args) => {
    const [low, high] = [args.user1, args.user2].sort();
    const friendships = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", low))
      .collect();
    const match = friendships.find((f) => f.user2 === high);
    if (match) await ctx.db.delete(match._id);
  },
});

// --- Queries ---

export const getFriends = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Get friendships where user is user1 or user2
    const asUser1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", args.clerkId))
      .collect();
    const asUser2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", args.clerkId))
      .collect();

    const friendClerkIds = [
      ...asUser1.map((f) => f.user2),
      ...asUser2.map((f) => f.user1),
    ];

    // Fetch friend profiles
    const friends = [];
    for (const id of friendClerkIds) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", id))
        .unique();
      if (user) {
        friends.push({
          clerkId: user.clerkId,
          name: user.name,
          level: user.level,
          wins: user.wins,
          bestStreak: user.bestStreak,
          avatarUrl: user.avatarUrl,
          avatarIndex: user.avatarIndex,
          activeFrame: user.activeFrame,
          isOnline: user.isOnline || false,
          lastSeen: user.lastSeen,
        });
      }
    }
    return friends;
  },
});

export const getPendingRequests = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("friendRequests")
      .withIndex("by_to", (q) =>
        q.eq("toClerkId", args.clerkId).eq("status", "pending"),
      )
      .collect();
  },
});

export const searchUsers = query({
  args: { query: v.string(), myClerkId: v.string() },
  handler: async (ctx, args) => {
    if (args.query.length < 2) return [];

    // Search by name prefix (case-sensitive in Convex, but we can do a full scan for now)
    const allUsers = await ctx.db.query("users").collect();
    const q = args.query.toLowerCase();
    return allUsers
      .filter(
        (u) =>
          u.clerkId !== args.myClerkId &&
          u.name.toLowerCase().includes(q),
      )
      .slice(0, 20)
      .map((u) => ({
        clerkId: u.clerkId,
        name: u.name,
        level: u.level,
        avatarUrl: u.avatarUrl,
        avatarIndex: u.avatarIndex,
        activeFrame: u.activeFrame,
      }));
  },
});
