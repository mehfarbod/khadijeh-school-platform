import { z } from "zod";

export const studentReviewItemTypeSchema = z.enum([
  "ABSENCE",
  "DISCIPLINE",
  "GENERAL",
]);

export const studentReviewItemStatusSchema = z.enum([
  "OPEN",
  "REVIEWED",
  "RESOLVED",
]);

export const studentReviewItemSchema = z
  .object({
    studentId: z
      .string()
      .trim()
      .min(1, "انتخاب دانش‌آموز الزامی است."),
    type: studentReviewItemTypeSchema,
    title: z
      .string()
      .trim()
      .min(1, "عنوان الزامی است.")
      .max(200, "عنوان بیش از حد طولانی است."),
    description: z
      .string()
      .trim()
      .max(3000, "توضیحات بیش از حد طولانی است.")
      .nullable()
      .optional(),
    occurredAt: z.string().datetime().nullable().optional(),
    status: studentReviewItemStatusSchema.default("OPEN"),
    isVisible: z.boolean().default(true),
  })
  .strict();
