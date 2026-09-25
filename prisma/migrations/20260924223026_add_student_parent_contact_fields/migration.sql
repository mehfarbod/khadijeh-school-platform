-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthCertificateSerial" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fatherEducation" TEXT,
ADD COLUMN     "fatherFirstName" TEXT,
ADD COLUMN     "fatherJob" TEXT,
ADD COLUMN     "fatherLastName" TEXT,
ADD COLUMN     "fatherMobile" TEXT,
ADD COLUMN     "fatherNationalId" TEXT,
ADD COLUMN     "landline" TEXT,
ADD COLUMN     "motherEducation" TEXT,
ADD COLUMN     "motherFirstName" TEXT,
ADD COLUMN     "motherJob" TEXT,
ADD COLUMN     "motherLastName" TEXT,
ADD COLUMN     "motherMobile" TEXT,
ADD COLUMN     "motherNationalId" TEXT;

-- CreateIndex
CREATE INDEX "Student_fatherNationalId_idx" ON "Student"("fatherNationalId");

-- CreateIndex
CREATE INDEX "Student_motherNationalId_idx" ON "Student"("motherNationalId");
