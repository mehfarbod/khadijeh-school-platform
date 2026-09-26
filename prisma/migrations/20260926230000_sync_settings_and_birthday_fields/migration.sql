-- Keep the database in sync with the Prisma schema and application settings.
ALTER TABLE "SchoolSettings"
  ADD COLUMN IF NOT EXISTS "namAddressUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "eitaaUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "baleUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "skyroomUrl" TEXT;

ALTER TABLE "Student"
  ADD COLUMN IF NOT EXISTS "isBirthdayVisible" BOOLEAN NOT NULL DEFAULT true;

-- Legacy social links are no longer supported by the application.
ALTER TABLE "SchoolSettings"
  DROP COLUMN IF EXISTS "instagramUrl",
  DROP COLUMN IF EXISTS "telegramUrl",
  DROP COLUMN IF EXISTS "whatsappUrl";
