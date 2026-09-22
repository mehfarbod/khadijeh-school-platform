/*
  Warnings:

  - You are about to drop the column `academicYear` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `className` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `grade` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "academicYear",
DROP COLUMN "className",
DROP COLUMN "grade";
