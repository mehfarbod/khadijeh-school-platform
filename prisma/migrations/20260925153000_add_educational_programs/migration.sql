CREATE TABLE "EducationalProgram" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationalProgram_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EducationalProgram_type_idx" ON "EducationalProgram"("type");
CREATE INDEX "EducationalProgram_isActive_idx" ON "EducationalProgram"("isActive");
CREATE INDEX "EducationalProgram_createdAt_idx" ON "EducationalProgram"("createdAt");