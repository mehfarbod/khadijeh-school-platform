/*
  Warnings:

  - A unique constraint covering the columns `[programId]` on the table `FamilyCounselingSession` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EducationalProgram_type_idx";

-- AlterTable
ALTER TABLE "ContactMessage" ALTER COLUMN "phone" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SchoolSettings" ALTER COLUMN "id" SET DEFAULT 'school-settings',
ALTER COLUMN "heroTitle" DROP DEFAULT,
ALTER COLUMN "heroDescription" DROP DEFAULT,
ALTER COLUMN "footerTitle" DROP DEFAULT,
ALTER COLUMN "footerDescription" DROP DEFAULT;

-- CreateTable
CREATE TABLE "StudentAccount" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentOtp" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentAccount_studentId_key" ON "StudentAccount"("studentId");

-- CreateIndex
CREATE INDEX "StudentOtp_studentId_idx" ON "StudentOtp"("studentId");

-- CreateIndex
CREATE INDEX "StudentOtp_phone_idx" ON "StudentOtp"("phone");

-- CreateIndex
CREATE INDEX "StudentOtp_expiresAt_idx" ON "StudentOtp"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyCounselingSession_programId_key" ON "FamilyCounselingSession"("programId");

-- AddForeignKey
ALTER TABLE "StudentAccount" ADD CONSTRAINT "StudentAccount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOtp" ADD CONSTRAINT "StudentOtp_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
