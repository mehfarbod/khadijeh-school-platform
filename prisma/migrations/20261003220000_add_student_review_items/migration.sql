CREATE TABLE "StudentReviewItem" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudentReviewItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StudentReviewItem_studentId_idx" ON "StudentReviewItem"("studentId");
CREATE INDEX "StudentReviewItem_status_idx" ON "StudentReviewItem"("status");
CREATE INDEX "StudentReviewItem_occurredAt_idx" ON "StudentReviewItem"("occurredAt");
CREATE INDEX "StudentReviewItem_isVisible_idx" ON "StudentReviewItem"("isVisible");

ALTER TABLE "StudentReviewItem"
ADD CONSTRAINT "StudentReviewItem_studentId_fkey"
FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;