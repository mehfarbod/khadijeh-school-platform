CREATE TABLE "SchoolSettings" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "officialName" TEXT,
    "slogan" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "address" TEXT,
    "postalCode" TEXT,
    "workingHours" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "siteTitle" TEXT,
    "siteDescription" TEXT,
    "footerText" TEXT,
    "instagramUrl" TEXT,
    "telegramUrl" TEXT,
    "whatsappUrl" TEXT,
    "mapUrl" TEXT,
    "schoolStatusEnabled" BOOLEAN NOT NULL DEFAULT false,
    "schoolStatus" TEXT,
    "showNews" BOOLEAN NOT NULL DEFAULT true,
    "showEvents" BOOLEAN NOT NULL DEFAULT true,
    "showBirthdays" BOOLEAN NOT NULL DEFAULT true,
    "showTopStudents" BOOLEAN NOT NULL DEFAULT true,
    "showDailyAbsences" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SchoolSettings" ("id", "schoolName", "schoolStatusEnabled", "showNews", "showEvents", "showBirthdays", "showTopStudents", "showDailyAbsences", "updatedAt")
VALUES ('school-settings', 'دبیرستان شاهد حضرت خدیجه (س)', false, true, true, true, true, true, CURRENT_TIMESTAMP);
