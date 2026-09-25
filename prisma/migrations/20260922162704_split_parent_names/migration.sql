/*
  Warnings:

  - You are about to drop the column `fatherName` on the `AdmissionApplication` table. All the data in the column will be lost.
  - You are about to drop the column `motherName` on the `AdmissionApplication` table. All the data in the column will be lost.
  - Added the required column `fatherFirstName` to the `AdmissionApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherLastName` to the `AdmissionApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherFirstName` to the `AdmissionApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherLastName` to the `AdmissionApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdmissionApplication" DROP COLUMN "fatherName",
DROP COLUMN "motherName",
ADD COLUMN     "fatherFirstName" TEXT NOT NULL,
ADD COLUMN     "fatherLastName" TEXT NOT NULL,
ADD COLUMN     "motherFirstName" TEXT NOT NULL,
ADD COLUMN     "motherLastName" TEXT NOT NULL;
