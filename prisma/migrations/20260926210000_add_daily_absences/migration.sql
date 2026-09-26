CREATE TABLE "DailyAbsence" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyAbsence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DailyAbsence_dateKey_idx" ON "DailyAbsence"("dateKey");
