-- CreateTable
CREATE TABLE "Birthday" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "firstName" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "birthday" TEXT NOT NULL,
    "photo" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Birthday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Birthday_isVisible_idx" ON "Birthday"("isVisible");

-- CreateIndex
CREATE INDEX "Birthday_birthday_idx" ON "Birthday"("birthday");

-- CreateIndex
CREATE INDEX "Birthday_studentId_idx" ON "Birthday"("studentId");

-- AddForeignKey
ALTER TABLE "Birthday" ADD CONSTRAINT "Birthday_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
