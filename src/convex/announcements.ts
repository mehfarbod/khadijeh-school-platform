import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("announcements").fullTableScan();
    if (args.activeOnly !== false) {
      q = q.filter((q) => q.eq(q.field("isActive"), true));
    }
    const items = await q.collect();
    return items.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt - a.createdAt;
    });
  },
});

export const pinned = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("announcements")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return items.filter((a) => a.isPinned).sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    isPinned: v.boolean(),
    isActive: v.boolean(),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("announcements", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("announcements"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const filtered = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("announcements").collect()).length;
  },
});
