-- Additive preparation for the future staff national-ID/password admin auth flow.
-- No existing User or Staff record is linked, populated, deactivated, or otherwise modified.

ALTER TABLE "Staff" ADD COLUMN "nationalId" TEXT;

ALTER TABLE "User"
  ALTER COLUMN "email" DROP NOT NULL,
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Staff_nationalId_key" ON "Staff"("nationalId");

CREATE TABLE "AdminPasswordResetOtp" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminPasswordResetOtp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminPasswordResetOtp_userId_consumedAt_createdAt_idx"
  ON "AdminPasswordResetOtp"("userId", "consumedAt", "createdAt");

CREATE INDEX "AdminPasswordResetOtp_phone_idx"
  ON "AdminPasswordResetOtp"("phone");

CREATE INDEX "AdminPasswordResetOtp_expiresAt_idx"
  ON "AdminPasswordResetOtp"("expiresAt");

ALTER TABLE "AdminPasswordResetOtp"
  ADD CONSTRAINT "AdminPasswordResetOtp_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
