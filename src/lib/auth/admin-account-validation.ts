import { z } from "zod";

import { ADMIN_ROLES } from "@/lib/auth/admin-account-policy";
import {
  adminPasswordSchema,
  validatePermanentAdminPassword,
} from "@/lib/auth/admin-auth-validation";
import {
  iranianMobileSchema,
  iranianNationalIdSchema,
} from "@/lib/validation/student";

const emailSchema = z
  .string()
  .trim()
  .email("ایمیل معتبر نیست.")
  .max(255, "ایمیل بیش از حد طولانی است.")
  .nullable()
  .optional();

export const provisionAdminAccountSchema = z
  .object({
    name: z.string().trim().max(200).optional(),
    email: emailSchema,
    nationalId: iranianNationalIdSchema.optional(),
    staffId: z.string().trim().min(1, "عضو کادر الزامی است."),
    role: z.enum(ADMIN_ROLES),
    isActive: z.boolean().optional().default(true),
    temporaryPassword: adminPasswordSchema,
  })
  .strict();

export const updateAdminAccountSchema = z
  .object({
    name: z.string().trim().max(200).nullable().optional(),
    email: emailSchema,
    staffId: z.string().trim().min(1).optional(),
    role: z.enum(ADMIN_ROLES).optional(),
    isActive: z.boolean().optional(),
    permissions: z
      .array(
        z.object({
          key: z.string().trim().min(1),
          allowed: z.boolean().nullable(),
        }),
      )
      .optional(),
  })
  .strict();

export const bootstrapSuperAdminSchema = z
  .object({
    nationalId: iranianNationalIdSchema,
    mobile: iranianMobileSchema,
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    password: adminPasswordSchema,
  })
  .strict()
  .superRefine((value, context) => {
    const passwordError = validatePermanentAdminPassword(
      value.password,
      value.nationalId,
    );
    if (passwordError) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: passwordError,
      });
    }
  });
