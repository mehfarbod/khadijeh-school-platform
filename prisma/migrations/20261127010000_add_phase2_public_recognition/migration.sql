-- Preserve legacy TopStudent records while enabling explicit class rankings.
ALTER TABLE "TopStudent"
ADD COLUMN "className" TEXT,
ADD COLUMN "rank" INTEGER;

CREATE INDEX "TopStudent_academicYear_className_rank_idx"
ON "TopStudent"("academicYear", "className", "rank");

CREATE TABLE "ScientificGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScientificGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScientificGroup_name_key" ON "ScientificGroup"("name");
CREATE INDEX "ScientificGroup_isPublished_idx" ON "ScientificGroup"("isPublished");

CREATE TABLE "ScientificGroupMinute" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "heldOn" TIMESTAMP(3),
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ScientificGroupMinute_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScientificGroupMinute_groupId_isPublished_idx" ON "ScientificGroupMinute"("groupId", "isPublished");
CREATE INDEX "ScientificGroupMinute_heldOn_idx" ON "ScientificGroupMinute"("heldOn");
ALTER TABLE "ScientificGroupMinute" ADD CONSTRAINT "ScientificGroupMinute_groupId_fkey"
FOREIGN KEY ("groupId") REFERENCES "ScientificGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Graduate" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "entranceExamYear" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Graduate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Graduate_entranceExamYear_idx" ON "Graduate"("entranceExamYear");
CREATE INDEX "Graduate_isPublished_idx" ON "Graduate"("isPublished");

CREATE TYPE "OutstandingSemester" AS ENUM ('FIRST', 'SECOND');

CREATE TABLE "OutstandingStudent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "semester" "OutstandingSemester" NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OutstandingStudent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OutstandingStudent_studentId_academicYearId_semester_key"
ON "OutstandingStudent"("studentId", "academicYearId", "semester");
CREATE INDEX "OutstandingStudent_academicYearId_semester_isPublished_idx"
ON "OutstandingStudent"("academicYearId", "semester", "isPublished");
ALTER TABLE "OutstandingStudent" ADD CONSTRAINT "OutstandingStudent_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OutstandingStudent" ADD CONSTRAINT "OutstandingStudent_academicYearId_fkey"
FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
