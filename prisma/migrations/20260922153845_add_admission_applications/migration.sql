-- CreateEnum
CREATE TYPE "AdmissionApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "AdmissionApplication" (
    "id" TEXT NOT NULL,
    "studentFirstName" TEXT NOT NULL,
    "studentLastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "nationalId" TEXT NOT NULL,
    "birthCertificateSerial" TEXT,
    "requestedGrade" TEXT NOT NULL,
    "studentMobile" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "fatherNationalId" TEXT,
    "fatherJob" TEXT,
    "fatherEducation" TEXT,
    "fatherMobile" TEXT,
    "motherName" TEXT NOT NULL,
    "motherNationalId" TEXT,
    "motherJob" TEXT,
    "motherEducation" TEXT,
    "motherMobile" TEXT,
    "address" TEXT NOT NULL,
    "landline" TEXT,
    "description" TEXT,
    "academicYearId" TEXT NOT NULL,
    "status" "AdmissionApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdmissionApplication_nationalId_idx" ON "AdmissionApplication"("nationalId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_academicYearId_idx" ON "AdmissionApplication"("academicYearId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_status_idx" ON "AdmissionApplication"("status");

-- CreateIndex
CREATE INDEX "AdmissionApplication_createdAt_idx" ON "AdmissionApplication"("createdAt");

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
