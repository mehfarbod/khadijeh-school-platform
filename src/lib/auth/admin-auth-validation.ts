import { z } from "zod";

import { normalizeDigits } from "@/lib/date/jalali";
import { iranianNationalIdSchema } from "@/lib/validation/student";

const passwordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ نویسه باشد.")
  .max(128, "رمز عبور نباید بیشتر از ۱۲۸ نویسه باشد.");

export const adminPasswordLoginSchema = z.object({
  nationalId: iranianNationalIdSchema,
  password: z
    .string()
    .min(1, "رمز عبور را وارد کنید.")
    .max(128, "رمز عبور نباید بیشتر از ۱۲۸ نویسه باشد."),
});

export const adminPasswordResetRequestSchema = z.object({
  nationalId: iranianNationalIdSchema,
});

export const adminPasswordResetOtpVerificationSchema = z.object({
  nationalId: iranianNationalIdSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "کد تأیید باید ۶ رقم باشد."),
});

export const newAdminPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "تکرار رمز عبور را وارد کنید.")
      .max(128, "تکرار رمز عبور نباید بیشتر از ۱۲۸ نویسه باشد."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند.",
    path: ["confirmPassword"],
  });

export function validatePermanentAdminPassword(
  password: string,
  nationalId: string,
) {
  if (normalizeDigits(password) === nationalId) {
    return "رمز عبور جدید نباید با کد ملی یکسان باشد.";
  }

  return null;
}
