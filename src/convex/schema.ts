import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  PARENT: "parent",
  STUDENT: "student",
  USER: "user",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.PARENT),
  v.literal(ROLES.STUDENT),
  v.literal(ROLES.USER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    students: defineTable({
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
      createdAt: v.number(),
    }).index("by_grade", ["grade"])
      .index("by_active", ["isActive"])
      .index("by_birthday", ["birthday"]),

    staff: defineTable({
      firstName: v.string(),
      lastName: v.string(),
      position: v.string(),
      subject: v.optional(v.string()),
      category: v.string(),
      bio: v.optional(v.string()),
      education: v.optional(v.string()),
      photo: v.optional(v.string()),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_category", ["category"])
      .index("by_active", ["isActive"]),

    courses: defineTable({
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
      createdAt: v.number(),
    }).index("by_slug", ["slug"])
      .index("by_status", ["status"])
      .index("by_active", ["isActive"]),

    courseRegistrations: defineTable({
      courseId: v.id("courses"),
      studentFirstName: v.string(),
      studentLastName: v.string(),
      grade: v.string(),
      studentId: v.optional(v.string()),
      guardianName: v.string(),
      guardianPhone: v.string(),
      email: v.optional(v.string()),
      notes: v.optional(v.string()),
      status: v.string(),
      createdAt: v.number(),
    }).index("by_course", ["courseId"])
      .index("by_status", ["status"]),

    events: defineTable({
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      date: v.string(),
      time: v.optional(v.string()),
      location: v.optional(v.string()),
      eventType: v.string(),
      coverImage: v.optional(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_date", ["date"])
      .index("by_active", ["isActive"]),

    announcements: defineTable({
      title: v.string(),
      content: v.string(),
      category: v.string(),
      isPinned: v.boolean(),
      isActive: v.boolean(),
      expiresAt: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_pinned", ["isPinned"])
      .index("by_active", ["isActive"]),

    news: defineTable({
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
      createdAt: v.number(),
    }).index("by_slug", ["slug"])
      .index("by_featured", ["isFeatured"])
      .index("by_active", ["isActive"]),

    topStudents: defineTable({
      studentId: v.optional(v.id("students")),
      firstName: v.string(),
      lastName: v.string(),
      grade: v.string(),
      achievement: v.string(),
      academicYear: v.string(),
      category: v.optional(v.string()),
      photo: v.optional(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_active", ["isActive"]),

    birthdays: defineTable({
      studentId: v.optional(v.id("students")),
      firstName: v.string(),
      grade: v.string(),
      birthday: v.string(),
      photo: v.optional(v.string()),
      isVisible: v.boolean(),
      createdAt: v.number(),
    }).index("by_birthday", ["birthday"])
      .index("by_visible", ["isVisible"]),

    achievements: defineTable({
      title: v.string(),
      description: v.string(),
      category: v.string(),
      date: v.optional(v.string()),
      icon: v.optional(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_active", ["isActive"]),

    galleryAlbums: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      category: v.string(),
      coverImage: v.optional(v.string()),
      date: v.optional(v.string()),
      isActive: v.boolean(),
      createdAt: v.number(),
    }).index("by_active", ["isActive"]),

    schedules: defineTable({
      grade: v.string(),
      className: v.string(),
      dayOfWeek: v.string(),
      period: v.number(),
      subject: v.string(),
      teacher: v.optional(v.string()),
      time: v.optional(v.string()),
      academicYear: v.string(),
    }).index("by_grade", ["grade", "academicYear"]),

    exams: defineTable({
      title: v.string(),
      grade: v.string(),
      subject: v.string(),
      date: v.string(),
      time: v.optional(v.string()),
      examType: v.string(),
      notes: v.optional(v.string()),
      academicYear: v.string(),
    }).index("by_grade", ["grade", "academicYear"]),

    contactMessages: defineTable({
      name: v.string(),
      email: v.string(),
      subject: v.optional(v.string()),
      message: v.string(),
      isRead: v.boolean(),
      createdAt: v.number(),
    }).index("by_read", ["isRead"]),

    schoolSettings: defineTable({
      key: v.string(),
      value: v.string(),
    }).index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
