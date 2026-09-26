INSERT INTO "EducationalProgram" ("id","type","title","description","content","isActive","createdAt","updatedAt") VALUES
('edu_program_weekly','weekly','برنامه هفتگی','برنامه کلاس‌ها و فعالیت‌های آموزشی دانش‌آموزان را مشاهده کنید.',NULL,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('edu_program_exams','exams','برنامه امتحانات','زمان‌بندی امتحانات و آزمون‌های مدرسه را در یکجا ببینید.',NULL,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('edu_program_calendar','calendar','تقویم آموزشی','تاریخ‌های مهم، مناسبت‌ها و رویدادهای آموزشی مدرسه.',NULL,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('edu_program_parents','parents-meetings','جلسات انجمن اولیا و مربیان','اطلاعیه‌ها، زمان‌بندی و اطلاعات مربوط به جلسات انجمن اولیا و مربیان.',NULL,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('edu_program_family','family-counseling','جلسات مشاوره خانواده','اطلاعات و زمان‌بندی جلسات مشاوره خانواده و برنامه‌های مرتبط با والدین.',NULL,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT ("type") DO NOTHING;