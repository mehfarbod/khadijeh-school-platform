import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { grade: v.optional(v.string()), activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("students").fullTableScan();
    if (args.activeOnly !== false) {
      q = q.filter((q) => q.eq(q.field("isActive"), true));
    }
    if (args.grade) {
      q = q.filter((q) => q.eq(q.field("grade"), args.grade!));
    }
    return await q.collect();
  },
});

export const get = query({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPublic = query({
  args: { grade: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("students").withIndex("by_active", (q) => q.eq("isActive", true));
    if (args.grade) {
      const all = await q.collect();
      return all.filter((s) => s.grade === args.grade);
    }
    return await q.collect();
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    grade: v.string(),
    className: v.string(),
    academicYear: v.string(),
    photo: v.optional(v.string()),
    birthday: v.optional(v.string()),
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),
    email: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("students", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("students"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    grade: v.optional(v.string()),
    className: v.optional(v.string()),
    academicYear: v.optional(v.string()),
    photo: v.optional(v.string()),
    birthday: v.optional(v.string()),
    guardianName: v.optional(v.string()),
    guardianPhone: v.optional(v.string()),
    email: v.optional(v.string()),
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
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("students").collect();
    return all.length;
  },
});

export const countActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("students").withIndex("by_active", (q) => q.eq("isActive", true)).collect();
    return all.length;
  },
});
