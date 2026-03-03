import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const syncUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    avatarUrl: v.string(),
    avatarIndex: v.number(),
    level: v.number(),
    xp: v.number(),
    wins: v.number(),
    losses: v.number(),
    streak: v.number(),
    bestStreak: v.number(),
    coins: v.number(),
    achievements: v.array(v.string()),
    activeFrame: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const userData = {
      ...args,
      lastSeen: Date.now(),
    };

    if (existing) {
      // Merge logic: take the higher stats
      await ctx.db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
        avatarIndex: args.avatarIndex,
        xp: Math.max(existing.xp, args.xp),
        level: Math.max(existing.level, args.level),
        wins: Math.max(existing.wins, args.wins),
        losses: Math.max(existing.losses, args.losses),
        streak: args.streak,
        bestStreak: Math.max(existing.bestStreak, args.bestStreak),
        coins: Math.max(existing.coins, args.coins),
        achievements: Array.from(new Set([...existing.achievements, ...args.achievements])),
        activeFrame: args.activeFrame || existing.activeFrame,
        lastSeen: userData.lastSeen,
      });
      return await ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("users", userData);
      return await ctx.db.get(id);
    }
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const updateOnlineStatus = mutation({
  args: { clerkId: v.string(), isOnline: v.boolean() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: args.isOnline,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getUsersByIds = query({
  args: { clerkIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const users = [];
    for (const id of args.clerkIds) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", id))
        .unique();
      if (user) {
        users.push({
          clerkId: user.clerkId,
          name: user.name,
          level: user.level,
          wins: user.wins,
          bestStreak: user.bestStreak,
          avatarUrl: user.avatarUrl,
          avatarIndex: user.avatarIndex,
          activeFrame: user.activeFrame,
        });
      }
    }
    return users;
  },
});
