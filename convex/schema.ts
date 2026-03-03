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
    isOnline: v.optional(v.boolean()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_level", ["level"])
    .index("by_name", ["name"]),

  friendRequests: defineTable({
    fromClerkId: v.string(),
    toClerkId: v.string(),
    fromName: v.string(),
    status: v.string(), // "pending" | "accepted" | "declined"
    createdAt: v.number(),
  })
    .index("by_to", ["toClerkId", "status"])
    .index("by_from", ["fromClerkId", "status"])
    .index("by_pair", ["fromClerkId", "toClerkId"]),

  friends: defineTable({
    user1: v.string(), // clerkId (alphabetically lower)
    user2: v.string(), // clerkId (alphabetically higher)
    createdAt: v.number(),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"]),

  messages: defineTable({
    fromClerkId: v.string(),
    toClerkId: v.string(),
    text: v.string(),
    type: v.string(), // "text" | "invite"
    roomCode: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["fromClerkId", "toClerkId"])
    .index("by_recipient", ["toClerkId", "read"]),

  rooms: defineTable({
    code: v.string(),
    hostClerkId: v.string(),
    hostName: v.string(),
    hostLevel: v.number(),
    isPublic: v.boolean(),
    status: v.string(), // "waiting" | "full" | "playing" | "closed"
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_status", ["status", "isPublic"]),
});
