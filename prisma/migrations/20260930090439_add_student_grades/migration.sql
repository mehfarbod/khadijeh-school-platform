-- CreateTable
CREATE TABLE "StudentGrade" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "teacherId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentGrade_studentId_idx" ON "StudentGrade"("studentId");

-- CreateIndex
CREATE INDEX "StudentGrade_academicYearId_idx" ON "StudentGrade"("academicYearId");

-- CreateIndex
CREATE INDEX "StudentGrade_teacherId_idx" ON "StudentGrade"("teacherId");

-- CreateIndex
CREATE INDEX "StudentGrade_subject_idx" ON "StudentGrade"("subject");

-- CreateIndex
CREATE INDEX "StudentGrade_term_idx" ON "StudentGrade"("term");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGrade_studentId_academicYearId_subject_term_key" ON "StudentGrade"("studentId", "academicYearId", "subject", "term");

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGrade" ADD CONSTRAINT "StudentGrade_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
