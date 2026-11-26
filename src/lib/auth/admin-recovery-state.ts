import type { Prisma } from "@/generated/prisma/client";
import { iranianMobileSchema } from "@/lib/validation/student";

export function isCurrentAdminRecoveryPhone(
  issuedPhone: string,
  currentPhone: string | null | undefined,
) {
  const parsed = iranianMobileSchema.safeParse(currentPhone ?? "");
  return parsed.success && parsed.data === issuedPhone;
}

export function invalidateOutstandingAdminRecoveryOtps(
  tx: Prisma.TransactionClient,
  userId: string,
  now = new Date(),
) {
  return tx.adminPasswordResetOtp.updateMany({
    where: { userId, consumedAt: null },
    data: { consumedAt: now },
  });
}
