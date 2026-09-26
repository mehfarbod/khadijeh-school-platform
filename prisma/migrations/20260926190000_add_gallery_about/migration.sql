CREATE TABLE "GalleryItem" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "categoryLabel" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GalleryItem_category_idx" ON "GalleryItem"("category");
CREATE INDEX "GalleryItem_isActive_idx" ON "GalleryItem"("isActive");
CREATE INDEX "GalleryItem_createdAt_idx" ON "GalleryItem"("createdAt");

CREATE TABLE "AboutPage" (
  "id" TEXT NOT NULL DEFAULT 'school-about',
  "heroBadge" TEXT NOT NULL,
  "heroTitle" TEXT NOT NULL,
  "heroDescription" TEXT NOT NULL,
  "introEyebrow" TEXT NOT NULL,
  "introTitle" TEXT NOT NULL,
  "introContent" TEXT NOT NULL,
  "stats" JSONB NOT NULL,
  "values" JSONB NOT NULL,
  "communityTitle" TEXT NOT NULL,
  "communityDescription" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AboutPage" ("id","heroBadge","heroTitle","heroDescription","introEyebrow","introTitle","introContent","stats","values","communityTitle","communityDescription","updatedAt")
VALUES ('school-about','شاهد حضرت خدیجه (س)','درباره‌ی مدرسه','آشنایی با مدرسه، رویکرد آموزشی و ارزش‌هایی که مسیر رشد دانش‌آموزان را شکل می‌دهند.','معرفی مدرسه','تربیت نسلی متعهد، خلاق و مستقل','دبیرستان دخترانه شاهد حضرت خدیجه (س) با هدف فراهم کردن محیطی امن، پویا و الهام‌بخش برای رشد همه‌جانبه دانش‌آموزان فعالیت می‌کند.\n\nما باور داریم هر دانش‌آموز ظرفیت‌ها و استعدادهای منحصربه‌فردی دارد و آموزش زمانی اثربخش است که در کنار دانش علمی، به رشد شخصیت، خلاقیت و مهارت‌های فردی نیز توجه شود.\n\nتلاش مجموعه بر این است که مدرسه فضایی برای یادگیری، تجربه، مشارکت و شکوفایی استعدادهای دانش‌آموزان باشد.',
'[{"value":"۳۵۰+","label":"دانش‌آموز"},{"value":"۲۵+","label":"دبیر"},{"value":"۹۵٪","label":"نرخ قبولی"},{"value":"۱۵+","label":"سال تجربه"}]'::jsonb,
'[{"title":"آموزش مبتنی بر کاوش","description":"یادگیری را فراتر از حفظ مطالب می‌دانیم و دانش‌آموزان را به پرسش، کشف و تفکر تشویق می‌کنیم.","icon":"BookOpen"},{"title":"پرورش شخصیت و اخلاق","description":"رشد علمی در کنار شکل‌گیری شخصیت، مسئولیت‌پذیری و ارزش‌های اخلاقی دنبال می‌شود.","icon":"Heart"},{"title":"خلاقیت و نوآوری","description":"دانش‌آموزان فرصت دارند ایده‌های خود را بیان کنند، تجربه کنند و راه‌حل‌های تازه پیدا کنند.","icon":"Lightbulb"},{"title":"محیط امن و حمایتی","description":"ایجاد محیطی آرام و حمایتگر برای یادگیری، ارتباط و رشد فردی از اصول مهم مدرسه است.","icon":"Shield"}]'::jsonb,
'جامعه‌ای برای رشد و یادگیری','دانش‌آموزان، دبیران و خانواده‌ها در مسیر رشد دانش‌آموزان همراه هستند.',CURRENT_TIMESTAMP);
