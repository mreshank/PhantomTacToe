import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    fromClerkId: v.string(),
    toClerkId: v.string(),
    text: v.string(),
    type: v.optional(v.string()),
    roomCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      fromClerkId: args.fromClerkId,
      toClerkId: args.toClerkId,
      text: args.text,
      type: args.type || "text",
      roomCode: args.roomCode,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const getConversation = query({
  args: { clerkId1: v.string(), clerkId2: v.string() },
  handler: async (ctx, args) => {
    // Get messages in both directions
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("fromClerkId", args.clerkId1).eq("toClerkId", args.clerkId2),
      )
      .collect();
    const received = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("fromClerkId", args.clerkId2).eq("toClerkId", args.clerkId1),
      )
      .collect();

    return [...sent, ...received]
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(-50);
  },
});

export const inviteToMatch = mutation({
  args: {
    fromClerkId: v.string(),
    toClerkId: v.string(),
    roomCode: v.string(),
    fromName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      fromClerkId: args.fromClerkId,
      toClerkId: args.toClerkId,
      text: `${args.fromName} invited you to a match!`,
      type: "invite",
      roomCode: args.roomCode,
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const markRead = mutation({
  args: { messageIds: v.array(v.id("messages")) },
  handler: async (ctx, args) => {
    for (const id of args.messageIds) {
      await ctx.db.patch(id, { read: true });
    }
  },
});

export const getUnreadCount = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("messages")
      .withIndex("by_recipient", (q) =>
        q.eq("toClerkId", args.clerkId).eq("read", false),
      )
      .collect();
    return unread.length;
  },
});
