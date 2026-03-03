import { query } from "./_generated/server";

export const getGlobalLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_level")
      .order("desc")
      .take(50);
  },
});
