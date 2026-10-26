-- Create the canonical class table first so existing enrollment data can be backfilled safely.
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Class_academicYearId_grade_name_key"
    ON "Class"("academicYearId", "grade", "name");
CREATE INDEX "Class_academicYearId_idx" ON "Class"("academicYearId");
CREATE INDEX "Class_grade_idx" ON "Class"("grade");
CREATE INDEX "Class_isActive_idx" ON "Class"("isActive");

ALTER TABLE "Class"
    ADD CONSTRAINT "Class_academicYearId_fkey"
    FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Teacher/class assignments are many-to-many because a class normally has
-- multiple subject teachers and a teacher can teach multiple classes.
CREATE TABLE "TeacherClassAssignment" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherClassAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeacherClassAssignment_classId_teacherId_subject_key"
    ON "TeacherClassAssignment"("classId", "teacherId", "subject");
CREATE INDEX "TeacherClassAssignment_classId_idx"
    ON "TeacherClassAssignment"("classId");
CREATE INDEX "TeacherClassAssignment_teacherId_idx"
    ON "TeacherClassAssignment"("teacherId");

ALTER TABLE "TeacherClassAssignment"
    ADD CONSTRAINT "TeacherClassAssignment_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "Class"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeacherClassAssignment"
    ADD CONSTRAINT "TeacherClassAssignment_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep the legacy className column for this migration phase. It lets the
-- application continue working while every old enrollment is linked to the
-- new canonical Class record.
ALTER TABLE "StudentEnrollment"
    ADD COLUMN "classId" TEXT;

-- Backfill one canonical Class for every existing (academicYear, grade,
-- className) combination. IDs are deterministic so the migration is safe to
-- reason about and does not depend on application-side cuid generation.
INSERT INTO "Class" ("id", "academicYearId", "grade", "name", "isActive", "createdAt", "updatedAt")
SELECT
    'class_' || md5("academicYearId" || ':' || "grade" || ':' || "className"),
    "academicYearId",
    "grade",
    "className",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "StudentEnrollment"
WHERE "className" IS NOT NULL AND btrim("className") <> ''
GROUP BY "academicYearId", "grade", "className";

-- Connect each existing enrollment to the Class created above.
UPDATE "StudentEnrollment" AS enrollment
SET "classId" = class."id"
FROM "Class" AS class
WHERE class."academicYearId" = enrollment."academicYearId"
  AND class."grade" = enrollment."grade"
  AND class."name" = enrollment."className";

CREATE INDEX "StudentEnrollment_classId_idx"
    ON "StudentEnrollment"("classId");

ALTER TABLE "StudentEnrollment"
    ADD CONSTRAINT "StudentEnrollment_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "Class"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
