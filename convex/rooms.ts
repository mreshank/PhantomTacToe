import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
  args: {
    code: v.string(),
    hostClerkId: v.string(),
    hostName: v.string(),
    hostLevel: v.number(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Clean up any old rooms from this host
    const oldRooms = await ctx.db
      .query("rooms")
      .filter((q) => q.eq(q.field("hostClerkId"), args.hostClerkId))
      .collect();
    for (const room of oldRooms) {
      if (room.status === "waiting" || room.status === "closed") {
        await ctx.db.delete(room._id);
      }
    }

    await ctx.db.insert("rooms", {
      ...args,
      status: "waiting",
      createdAt: Date.now(),
    });
  },
});

export const listPublicRooms = query({
  args: {},
  handler: async (ctx) => {
    const staleThreshold = Date.now() - 10 * 60 * 1000;
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_status", (q) =>
        q.eq("status", "waiting").eq("isPublic", true),
      )
      .filter((q) => q.gte(q.field("createdAt"), staleThreshold))
      .collect();
    return rooms.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const joinRoom = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (room && room.status === "waiting") {
      await ctx.db.patch(room._id, { status: "full" });
      return room;
    }
    return null;
  },
});

export const quickJoin = query({
  args: {},
  handler: async (ctx) => {
    const staleThreshold = Date.now() - 10 * 60 * 1000;
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_status", (q) =>
        q.eq("status", "waiting").eq("isPublic", true),
      )
      .filter((q) => q.gte(q.field("createdAt"), staleThreshold))
      .collect();
    // Return oldest available room
    if (rooms.length === 0) return null;
    rooms.sort((a, b) => a.createdAt - b.createdAt);
    return rooms[0];
  },
});

export const closeRoom = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (room) {
      await ctx.db.delete(room._id);
    }
  },
});

export const getRoomByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
  },
});

export const cleanupStaleRooms = mutation({
  args: {},
  handler: async (ctx) => {
    const staleThreshold = Date.now() - 10 * 60 * 1000;
    const staleRooms = await ctx.db
      .query("rooms")
      .filter((q) => q.lt(q.field("createdAt"), staleThreshold))
      .collect();
      
    for (const room of staleRooms) {
      await ctx.db.delete(room._id);
    }
  },
});
