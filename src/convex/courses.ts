import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("courses").fullTableScan();
    if (args.activeOnly !== false) {
      q = q.filter((q) => q.eq(q.field("isActive"), true));
    }
    return await q.collect();
  },
});

export const get = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    fullDescription: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    instructor: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    schedule: v.optional(v.string()),
    duration: v.optional(v.string()),
    capacity: v.number(),
    currentRegistrations: v.number(),
    price: v.optional(v.number()),
    status: v.string(),
    category: v.string(),
    gradeLevel: v.optional(v.string()),
    registrationDeadline: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", { ...args, createdAt: Date.now() });
  },
});

export const update = mutation({
  args: {
    id: v.id("courses"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    fullDescription: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    instructor: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    schedule: v.optional(v.string()),
    duration: v.optional(v.string()),
    capacity: v.optional(v.number()),
    currentRegistrations: v.optional(v.number()),
    price: v.optional(v.number()),
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    registrationDeadline: v.optional(v.string()),
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
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("courses").collect()).length;
  },
});

// ── Registrations ──
export const register = mutation({
  args: {
    courseId: v.id("courses"),
    studentFirstName: v.string(),
    studentLastName: v.string(),
    grade: v.string(),
    studentId: v.optional(v.string()),
    guardianName: v.string(),
    guardianPhone: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) throw new Error("دوره یافت نشد");
    if (course.currentRegistrations >= course.capacity) {
      throw new Error("ظرفیت دوره تکمیل شده است");
    }
    await ctx.db.insert("courseRegistrations", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.courseId, {
      currentRegistrations: course.currentRegistrations + 1,
    });
  },
});

export const listRegistrations = query({
  args: { courseId: v.optional(v.id("courses")), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("courseRegistrations").fullTableScan();
    if (args.courseId) {
      q = q.filter((q) => q.eq(q.field("courseId"), args.courseId!));
    }
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status!));
    }
    return await q.collect();
  },
});

export const updateRegistration = mutation({
  args: {
    id: v.id("courseRegistrations"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const removeRegistration = mutation({
  args: { id: v.id("courseRegistrations") },
  handler: async (ctx, args) => {
    const reg = await ctx.db.get(args.id);
    if (reg) {
      const course = await ctx.db.get(reg.courseId);
      if (course && course.currentRegistrations > 0) {
        await ctx.db.patch(reg.courseId, {
          currentRegistrations: course.currentRegistrations - 1,
        });
      }
    }
    await ctx.db.delete(args.id);
  },
});
