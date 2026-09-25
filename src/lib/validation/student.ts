import { z } from "zod";

import { isValidJalaliDate, normalizeDigits } from "@/lib/date/jalali";

/**
 * Iranian national ID validation
 */
export const iranianNationalIdSchema = z
  .string()
  .trim()
  .transform(normalizeDigits)
  .pipe(z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد."))
  .refine((value) => {
    if (/^(\d)\1{9}$/.test(value)) {
      return false;
    }

    const digits = value.split("").map(Number);

    const sum = digits
      .slice(0, 9)
      .reduce((total, digit, index) => total + digit * (10 - index), 0);

    const remainder = sum % 11;

    const checkDigit = digits[9];

    return checkDigit === (remainder < 2 ? remainder : 11 - remainder);
  }, "کد ملی معتبر نیست.");

/**
 * Iranian mobile number
 *
 * Supports Persian/Arabic digits and normalizes them
 * before validation.
 */
export const iranianMobileSchema = z
  .string()
  .trim()
  .transform(normalizeDigits)
  .pipe(z.string().regex(/^09\d{9}$/, "شماره تلفن همراه نامعتبر است."));

/**
 * Optional national ID
 */
export const optionalNationalIdSchema = iranianNationalIdSchema
  .nullable()
  .optional();

/**
 * Optional mobile
 */
export const optionalMobileSchema = iranianMobileSchema.nullable().optional();

/**
 * Standard academic grades
 *
 * Internally:
 * 10 = دهم
 * 11 = یازدهم
 * 12 = دوازدهم
 *
 * Old Persian values are also accepted and
 * converted to the new internal format.
 */
export const gradeSchema = z
  .string()
  .trim()
  .transform((value) => {
    if (value === "دهم") {
      return "10";
    }

    if (value === "یازدهم") {
      return "11";
    }

    if (value === "دوازدهم") {
      return "12";
    }

    return normalizeDigits(value);
  })
  .pipe(
    z.enum(["10", "11", "12"], {
      message: "پایه تحصیلی باید دهم، یازدهم یا دوازدهم باشد.",
    }),
  );

/**
 * Jalali birthday
 */
export const jalaliBirthdaySchema = z
  .string()
  .trim()
  .transform(normalizeDigits)
  .refine(
    (value) => /^\d{4}\/\d{2}\/\d{2}$/.test(value),
    "تاریخ تولد باید به صورت ۱۴۰۰/۰۱/۰۱ باشد.",
  )
  .refine(isValidJalaliDate, "تاریخ تولد معتبر نیست.");

/**
 * Optional Jalali birthday
 */
export const optionalJalaliBirthdaySchema = jalaliBirthdaySchema
  .nullable()
  .optional();

/**
 * Reusable optional text field
 */
const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).nullable().optional();

/**
 * Student personal information
 */
export const studentPersonalSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "نام الزامی است.")
    .max(100, "نام بیش از حد طولانی است."),

  lastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی الزامی است.")
    .max(100, "نام خانوادگی بیش از حد طولانی است."),

  nationalId: optionalNationalIdSchema,

  birthCertificateSerial: optionalText(
    100,
    "شماره سری شناسنامه بیش از حد طولانی است.",
  ),

  mobile: optionalMobileSchema,

  birthday: optionalJalaliBirthdaySchema,
});

/**
 * Father information
 */
export const fatherSchema = z.object({
  fatherFirstName: optionalText(100, "نام پدر بیش از حد طولانی است."),

  fatherLastName: optionalText(100, "نام خانوادگی پدر بیش از حد طولانی است."),

  fatherNationalId: optionalNationalIdSchema,

  fatherJob: optionalText(150, "شغل پدر بیش از حد طولانی است."),

  fatherEducation: optionalText(150, "تحصیلات پدر بیش از حد طولانی است."),

  fatherMobile: optionalMobileSchema,
});

/**
 * Mother information
 */
export const motherSchema = z.object({
  motherFirstName: optionalText(100, "نام مادر بیش از حد طولانی است."),

  motherLastName: optionalText(100, "نام خانوادگی مادر بیش از حد طولانی است."),

  motherNationalId: optionalNationalIdSchema,

  motherJob: optionalText(150, "شغل مادر بیش از حد طولانی است."),

  motherEducation: optionalText(150, "تحصیلات مادر بیش از حد طولانی است."),

  motherMobile: optionalMobileSchema,
});

/**
 * Contact information
 */
export const contactSchema = z.object({
  address: optionalText(1000, "آدرس بیش از حد طولانی است."),

  landline: optionalText(30, "شماره تلفن ثابت بیش از حد طولانی است."),

  description: optionalText(2000, "توضیحات بیش از حد طولانی است."),
});

/**
 * Complete student profile
 *
 * This is the common contract used by
 * Admin Students and Student APIs.
 */
export const studentProfileSchema = studentPersonalSchema
  .merge(fatherSchema)
  .merge(motherSchema)
  .merge(contactSchema);

/**
 * Enrollment information
 */
export const studentEnrollmentSchema = z.object({
  academicYearId: z.string().trim().min(1, "سال تحصیلی الزامی است."),

  grade: gradeSchema,

  className: optionalText(50, "نام کلاس بیش از حد طولانی است."),
});
