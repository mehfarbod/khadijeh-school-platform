-- Align ContactMessage with the public contact form.
ALTER TABLE "ContactMessage"
  ADD COLUMN "phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "department" TEXT;

ALTER TABLE "ContactMessage"
  ALTER COLUMN "email" DROP NOT NULL;

CREATE INDEX "ContactMessage_department_idx" ON "ContactMessage"("department");