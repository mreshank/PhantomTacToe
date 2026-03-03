import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
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
    lastSeen: v.number(),
  }).index("by_clerkId", ["clerkId"])
    .index("by_level", ["level"]),
});
