import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("topStudents").fullTableScan();
    if (args.activeOnly !== false) {
      q = q.filter((q) => q.eq(q.field("isActive"), true));
    }
    return await q.collect();
  },
});

export const create = mutation({
  args: {
    studentId: v.optional(v.id("students")),
    firstName: v.string(),
    lastName: v.string(),
    grade: v.string(),
    achievement: v.string(),
    academicYear: v.string(),
    category: v.optional(v.string()),
    photo: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("topStudents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("topStudents"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    grade: v.optional(v.string()),
    achievement: v.optional(v.string()),
    academicYear: v.optional(v.string()),
    category: v.optional(v.string()),
    photo: v.optional(v.string()),
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
  args: { id: v.id("topStudents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
