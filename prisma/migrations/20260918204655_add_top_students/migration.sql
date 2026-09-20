-- CreateTable
CREATE TABLE "TopStudent" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "achievement" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopStudent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopStudent_academicYear_idx" ON "TopStudent"("academicYear");

-- CreateIndex
CREATE INDEX "TopStudent_isActive_idx" ON "TopStudent"("isActive");
