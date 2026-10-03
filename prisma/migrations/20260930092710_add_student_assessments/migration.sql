-- CreateTable
CREATE TABLE "StudentAssessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'هفتگی',
    "title" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3),
    "score" DECIMAL(5,2) NOT NULL,
    "teacherId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAssessment_studentId_idx" ON "StudentAssessment"("studentId");

-- CreateIndex
CREATE INDEX "StudentAssessment_academicYearId_idx" ON "StudentAssessment"("academicYearId");

-- CreateIndex
CREATE INDEX "StudentAssessment_subject_idx" ON "StudentAssessment"("subject");

-- CreateIndex
CREATE INDEX "StudentAssessment_assessmentDate_idx" ON "StudentAssessment"("assessmentDate");

-- CreateIndex
CREATE INDEX "StudentAssessment_teacherId_idx" ON "StudentAssessment"("teacherId");

-- AddForeignKey
ALTER TABLE "StudentAssessment" ADD CONSTRAINT "StudentAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssessment" ADD CONSTRAINT "StudentAssessment_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssessment" ADD CONSTRAINT "StudentAssessment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
