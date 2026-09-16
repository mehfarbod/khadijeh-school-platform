import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("news").fullTableScan();
    if (args.activeOnly !== false) {
      q = q.filter((q) => q.eq(q.field("isActive"), true));
    }
    const items = await q.collect();
    if (args.category) return items.filter((n) => n.category === args.category);
    return items.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const featured = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("news")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .collect();
    return items.filter((n) => n.isActive).sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImage: v.optional(v.string()),
    author: v.optional(v.string()),
    category: v.string(),
    tags: v.optional(v.array(v.string())),
    isFeatured: v.boolean(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("news", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("news"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    author: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
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
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
