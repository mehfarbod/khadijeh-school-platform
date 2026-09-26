ALTER TABLE "SchoolSettings"
  ADD COLUMN "heroTitle" TEXT NOT NULL DEFAULT 'دبیرستان دخترانه شاهد حضرت خدیجه (س)',
  ADD COLUMN "heroDescription" TEXT NOT NULL DEFAULT 'محیطی امن، پویا و الهام‌بخش برای رشد علمی، اخلاقی و خلاقانه دانش‌آموزان؛ جایی برای یادگیری، تجربه و ساختن آینده‌ای روشن.',
  ADD COLUMN "footerTitle" TEXT NOT NULL DEFAULT 'شاهد حضرت خدیجه (س)',
  ADD COLUMN "footerDescription" TEXT NOT NULL DEFAULT 'دبیرستان دخترانه شاهد حضرت خدیجه (س) با هدف پرورش استعدادهای علمی و مهارتی دانش‌آموزان.',
  ADD COLUMN "namAddressUrl" TEXT,
  ADD COLUMN "eitaaUrl" TEXT,
  ADD COLUMN "baleUrl" TEXT,
  ADD COLUMN "skyroomUrl" TEXT;