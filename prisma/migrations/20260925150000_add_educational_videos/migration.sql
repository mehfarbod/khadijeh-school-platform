CREATE TABLE "EducationalVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationalVideo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EducationalVideo_slug_key" ON "EducationalVideo"("slug");
CREATE INDEX "EducationalVideo_subject_idx" ON "EducationalVideo"("subject");
CREATE INDEX "EducationalVideo_grade_idx" ON "EducationalVideo"("grade");
CREATE INDEX "EducationalVideo_isActive_idx" ON "EducationalVideo"("isActive");
CREATE INDEX "EducationalVideo_createdAt_idx" ON "EducationalVideo"("createdAt");

ALTER TABLE "EducationalVideo"
ADD CONSTRAINT "EducationalVideo_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;