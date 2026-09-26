-- Dedicated content structures for the five educational-program sections.

CREATE TABLE "WeeklySchedule" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklySchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeeklyScheduleEntry" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "subject" TEXT NOT NULL,
    "teacher" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyScheduleEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExamSchedule" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExamScheduleEntry" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT,
    "grade" TEXT NOT NULL,
    "className" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamScheduleEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EducationalCalendarEvent" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationalCalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ParentMeeting" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT,
    "topic" TEXT NOT NULL,
    "audience" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentMeeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FamilyCounselingSession" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT,
    "counselor" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "audience" TEXT,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyCounselingSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WeeklySchedule_programId_key" ON "WeeklySchedule"("programId");
CREATE INDEX "WeeklyScheduleEntry_scheduleId_idx" ON "WeeklyScheduleEntry"("scheduleId");
CREATE INDEX "WeeklyScheduleEntry_className_idx" ON "WeeklyScheduleEntry"("className");
CREATE INDEX "WeeklyScheduleEntry_day_idx" ON "WeeklyScheduleEntry"("day");
CREATE UNIQUE INDEX "WeeklyScheduleEntry_scheduleId_className_day_startTime_key"
    ON "WeeklyScheduleEntry"("scheduleId", "className", "day", "startTime");

CREATE UNIQUE INDEX "ExamSchedule_programId_key" ON "ExamSchedule"("programId");
CREATE INDEX "ExamScheduleEntry_scheduleId_idx" ON "ExamScheduleEntry"("scheduleId");
CREATE INDEX "ExamScheduleEntry_grade_idx" ON "ExamScheduleEntry"("grade");
CREATE INDEX "ExamScheduleEntry_date_idx" ON "ExamScheduleEntry"("date");

CREATE INDEX "EducationalCalendarEvent_programId_idx" ON "EducationalCalendarEvent"("programId");
CREATE INDEX "EducationalCalendarEvent_date_idx" ON "EducationalCalendarEvent"("date");
CREATE INDEX "EducationalCalendarEvent_eventType_idx" ON "EducationalCalendarEvent"("eventType");
CREATE INDEX "EducationalCalendarEvent_isActive_idx" ON "EducationalCalendarEvent"("isActive");

CREATE INDEX "ParentMeeting_programId_idx" ON "ParentMeeting"("programId");
CREATE INDEX "ParentMeeting_date_idx" ON "ParentMeeting"("date");
CREATE INDEX "ParentMeeting_isActive_idx" ON "ParentMeeting"("isActive");

CREATE INDEX "FamilyCounselingSession_date_idx" ON "FamilyCounselingSession"("date");
CREATE INDEX "FamilyCounselingSession_isActive_idx" ON "FamilyCounselingSession"("isActive");

ALTER TABLE "WeeklySchedule"
  ADD CONSTRAINT "WeeklySchedule_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "EducationalProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WeeklyScheduleEntry"
  ADD CONSTRAINT "WeeklyScheduleEntry_scheduleId_fkey"
  FOREIGN KEY ("scheduleId") REFERENCES "WeeklySchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExamSchedule"
  ADD CONSTRAINT "ExamSchedule_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "EducationalProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExamScheduleEntry"
  ADD CONSTRAINT "ExamScheduleEntry_scheduleId_fkey"
  FOREIGN KEY ("scheduleId") REFERENCES "ExamSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EducationalCalendarEvent"
  ADD CONSTRAINT "EducationalCalendarEvent_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "EducationalProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ParentMeeting"
  ADD CONSTRAINT "ParentMeeting_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "EducationalProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyCounselingSession"
  ADD CONSTRAINT "FamilyCounselingSession_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "EducationalProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
