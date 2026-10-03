-- Existing OTP-only student accounts are initialized lazily by the application.
-- passwordHash stays nullable until the first password login or password reset,
-- so no plaintext or reversible initial credential is ever stored.
ALTER TABLE "StudentAccount"
  ADD COLUMN "passwordHash" TEXT,
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
