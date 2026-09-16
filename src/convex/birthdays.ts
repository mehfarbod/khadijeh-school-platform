import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("birthdays").fullTableScan();
    if (args.activeOnly !== false) {
      q = q.filter((q) => q.eq(q.field("isVisible"), true));
    }
    return await q.collect();
  },
});

export const today = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayStr = `${month}-${day}`;
    const items = await ctx.db
      .query("birthdays")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .collect();
    return items.filter((b) => b.birthday.endsWith(todayStr));
  },
});

export const upcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const items = await ctx.db
      .query("birthdays")
      .withIndex("by_visible", (q) => q.eq("isVisible", true))
      .collect();
    return items
      .filter((b) => {
        const parts = b.birthday.split("-");
        const bMonth = parseInt(parts[0]);
        const bDay = parseInt(parts[1]);
        if (bMonth > month || (bMonth === month && bDay >= day)) return true;
        return false;
      })
      .sort((a, b) => a.birthday.localeCompare(b.birthday))
      .slice(0, args.limit ?? 5);
  },
});

export const create = mutation({
  args: {
    studentId: v.optional(v.id("students")),
    firstName: v.string(),
    grade: v.string(),
    birthday: v.string(),
    photo: v.optional(v.string()),
    isVisible: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("birthdays", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("birthdays"),
    firstName: v.optional(v.string()),
    grade: v.optional(v.string()),
    birthday: v.optional(v.string()),
    photo: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
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
  args: { id: v.id("birthdays") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
