import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("students").first();
    if (existing) return "already_seeded";

    const now = Date.now();
    const year = "1404-1405";

    // ── Students ──
    const studentData = [
      { firstName: "زهرا", lastName: "احمدی", grade: "دهم", className: "الف", birthday: "03-15", isActive: true },
      { firstName: "فاطمه", lastName: "حسینی", grade: "دهم", className: "ب", birthday: "05-22", isActive: true },
      { firstName: "مهدیه", lastName: "کریمی", grade: "دهم", className: "الف", birthday: "09-08", isActive: true },
      { firstName: "نرگس", lastName: "محمدی", grade: "یازدهم", className: "الف", birthday: "11-30", isActive: true },
      { firstName: "مریم", lastName: "رضایی", grade: "یازدهم", className: "ب", birthday: "02-14", isActive: true },
      { firstName: "سارا", lastName: "عباسی", grade: "یازدهم", className: "الف", birthday: "07-19", isActive: true },
      { firstName: "النا", lastName: "نوری", grade: "دوازدهم", className: "الف", birthday: "01-05", isActive: true },
      { firstName: "یاسمن", lastName: "قادری", grade: "دوازدهم", className: "ب", birthday: "04-28", isActive: true },
      { firstName: "هانیه", lastName: ".bootstrap", grade: "دهم", className: "ب", birthday: "08-12", isActive: true },
      { firstName: "ریحانه", lastName: "ossaati", grade: "دوازدهم", className: "الف", birthday: "06-03", isActive: true },
      { firstName: "ستایش", lastName: "مرادی", grade: "دهم", className: "الف", birthday: "10-17", isActive: true },
      { firstName: "نقشه", lastName: "software", grade: "یازدهم", className: "ب", birthday: "12-25", isActive: true },
      { firstName: "泽赫拉", lastName: "typeError", grade: "دهم", className: "ب", birthday: "03-20", isActive: true },
      { firstName: "نیلوفر", lastName: "rented", grade: "دوازدهم", className: "ب", birthday: "05-11", isActive: true },
      { firstName: "آتنا", lastName: "safe", grade: "یازدهم", className: "الف", birthday: "08-30", isActive: true },
    ];

    const studentIds: string[] = [];
    for (const s of studentData) {
      const id = await ctx.db.insert("students", {
        ...s,
        academicYear: year,
        createdAt: now,
      });
      studentIds.push(id);
    }

    // ── Staff ──
    const staffData = [
      { firstName: "فاطمه", lastName: ".bootstrap", position: "مدیر مدرسه", category: "مدیریت", education: "کارشناسی ارشد مدیریت آموزشی", bio: "بیش از ۲۰ سال سابقه مدیریت آموزشی", isActive: true },
      { firstName: "مریم", lastName: "safe", position: "معاون آموزشی", category: "مدیریت", education: "کارشناسی ارشد برنامه‌ریزی درسی", isActive: true },
      { firstName: "زهرا", lastName: "status", position: "دبیر ریاضی", subject: "ریاضیات", category: "دبیران", education: "کارشناسی ارشد ریاضیات", isActive: true },
      { firstName: "سارا", lastName: "error", position: "دبیر فیزیک", subject: "فیزیک", category: "دبیران", education: "کارشناسی ارشد فیزیک", isActive: true },
      { firstName: "النا", lastName: "please", position: "دبیر شیمی", subject: "شیمی", category: "دبیران", education: "کارشناسی ارشد شیمی", isActive: true },
      { firstName: "نرگس", lastName: "try", position: "دبیر زبان انگلیسی", subject: "زبان انگلیسی", category: "دبیران", education: "کارشناسی ارشد زبانشناسی", isActive: true },
      { firstName: "مهدیه", lastName: "console", position: "دبیر ادبیات فارسی", subject: "ادبیات فارسی", category: "دبیران", education: "کارشناسی ارشد ادبیات فارسی", isActive: true },
      { firstName: "فاطمه", lastName: "object", position: "دبیر علوم تجربی", subject: "علوم تجربی", category: "دبیران", education: "کارشناسی ارشد زیست‌شناسی", isActive: true },
      { firstName: "هانیه", lastName: "type", position: "دبیر تاریخ و جغرافیا", subject: "تاریخ و جغرافیا", category: "دبیران", education: "کارشناسی ارشد تاریخ", isActive: true },
      { firstName: "ریحانه", lastName: "data", position: "دبیر قرآن و معارف اسلامی", subject: "قرآن و معارف اسلامی", category: "دبیران", education: "کارشناسی ارشد علوم قرآنی", isActive: true },
      { firstName: "آتنا", lastName: "error", position: "دبیر هنر", subject: "هنر", category: "دبیران", education: "کارشناسی ارشد هنرهای تجسمی", isActive: true },
      { firstName: "نیلوفر", lastName: "object", position: "دبیر تربیت بدنی", subject: "تربیت بدنی", category: "دبیران", education: "کارشناسی ارشد تربیت بدنی", isActive: true },
      { firstName: "مریم", lastName: "safe", position: "مشاور تحصیلی", category: "مشاوران", education: "کارشناسی ارشد روانشناسی", isActive: true },
      { firstName: "فاطمه", lastName: "status", position: "مشاور انتخاب رشته", category: "مشاوران", education: "کارشناسی ارشد مشاوره", isActive: true },
      { firstName: "زهرا", lastName: "please", position: "کارشناس فناوری اطلاعات", category: "کادر اجرایی", education: "کارشناسی کامپیوتر", isActive: true },
    ];

    for (const s of staffData) {
      await ctx.db.insert("staff", { ...s, createdAt: now });
    }

    // ── Events ──
    const eventsData = [
      { title: "جشنواره علمی دانش‌آموزی", slug: "science-festival", description: "جشنواره سالانه علمی با حضور دانش‌آموزان مقاطع مختلف", date: "2026-10-15", time: "۰۸:۰۰ - ۱۲:۰۰", location: "سالن اجتماعات مدرسه", eventType: "جشنواره", isActive: true },
      { title: "نشست اولیا و مربیان", slug: "parent-teacher", description: "جلسه مشترک اولیا و معلمان برای بررسی عملکرد تحصیلی دانش‌آموزان", date: "2026-10-20", time: "۱۴:۰۰ - ۱۶:۰۰", location: "کلاس ۱۰ الف", eventType: "جلسه", isActive: true },
      { title: "آزمون میان‌ترم نوبت اول", slug: "midterm-exam", description: "آزمون میان‌ترم نوبت اول سال تحصیلی ۱۴۰۵-۱۴۰۴", date: "2026-11-01", time: "۰۸:۰۰ - ۱۱:۰۰", location: " salon امتحانات", eventType: "امتحان", isActive: true },
      { title: "اردوی فرهنگی - مشهد مقدس", slug: "cultural-trip-mashhad", description: "اردوی زیارتی فرهنگی به مشهد مقدس ویژه دانش‌آموزان پایه یازدهم", date: "2026-11-15", time: "۰۶:۰۰ حرکت از مدرسه", location: "مشهد مقدس", eventType: "اردو", isActive: true },
      { title: "مراسم روز معلم", slug: "teacher-day", description: "مراسم بزرگداشت روز معلم با حضور کلیه دانش‌آموزان و کارکنان مدرسه", date: "2026-12-02", time: "۱۰:۰۰ - ۱۲:۰۰", location: "سالن اجتماعات مدرسه", eventType: "مراسم", isActive: true },
    ];

    for (const e of eventsData) {
      await ctx.db.insert("events", { ...e, createdAt: now });
    }

    // ── Announcements ──
    const announcementsData = [
      { title: "ثبت‌نام دوره‌های تقویتی نوبت دوم", content: "ثبت‌نام دوره‌های تقویتی ریاضی، فیزیک و شیمی آغاز شد. علاقه‌مندان تا پایان آبان ماه فرصت دارند.", category: "ثبت‌نام", isPinned: true, isActive: true },
      { title: "تغییر ساعت ورود مدرسه", content: "از ابتدای آبان ماه، ساعت ورود به مدرسه ۷:۳۰ صبح خواهد بود.", category: "تغییرات", isPinned: false, isActive: true },
      { title: "مسابقه قرائت قرآن کریم", content: "مسابقه سالانه قرائت قرآن ویژه کلیه پایه‌ها برگزار می‌شود. ثبت‌نام در دفتر معاونت فرهنگی.", category: "مسابقات", isPinned: false, isActive: true },
      { title: "کارگاه مهارت‌های مطالعه و یادگیری", content: "کارگاه تخصصی مهارت‌های مطالعه و یادگیری مؤثر ویژه دانش‌آموزان پایه دهم.", category: "آموزشی", isPinned: false, isActive: true },
    ];

    for (const a of announcementsData) {
      await ctx.db.insert("announcements", { ...a, createdAt: now });
    }

    // ── Top Students ──
    const topStudentsData = [
      { firstName: "زهرا", lastName: "احمدی", grade: "دهم الف", achievement: "رتبه اول المپیاد ریاضی استانی", academicYear: year, category: "المپیاد", isActive: true },
      { firstName: "فاطمه", lastName: "حسینی", grade: "دهم ب", achievement: "نفر اول مسابقات علمی کشوری", academicYear: year, category: "علمی", isActive: true },
      { firstName: "مهدیه", lastName: "کریمی", grade: "دهم الف", achievement: "قهرمان مسابقات ورزشی منطقه", academicYear: year, category: "ورزشی", isActive: true },
      { firstName: "نرگس", lastName: "محمدی", grade: "یازدهم الف", achievement: "رتبه سوم المپیاد شیمی استانی", academicYear: year, category: "المپیاد", isActive: true },
      { firstName: "مریم", lastName: "رضایی", grade: "یازدهم ب", achievement: "برگزیده مسابقات خوشنویسی کشوری", academicYear: year, category: "فرهنگی", isActive: true },
      { firstName: "سارا", lastName: "عباسی", grade: "یازدهم الف", achievement: "رتبه اول تیم رباتیک منطقه", academicYear: year, category: "علمی", isActive: true },
      { firstName: "النا", lastName: "نوری", grade: "دوازدهم الف", achievement: "رتبه ۳۵۰ کنکور سراسری ریاضی", academicYear: year, category: "کنکور", isActive: true },
      { firstName: "یاسمن", lastName: "قادری", grade: "دوازدهم ب", achievement: "مدال طلای مسابقات نجوم", academicYear: year, category: "علمی", isActive: true },
    ];

    for (const ts of topStudentsData) {
      await ctx.db.insert("topStudents", { ...ts, createdAt: now });
    }

    // ── Birthdays ──
    const birthdaysData = [
      { firstName: "زهرا", grade: "دهم الف", birthday: "1404-03-15", isVisible: true },
      { firstName: "فاطمه", grade: "دهم ب", birthday: "1404-05-22", isVisible: true },
      { firstName: "مهدیه", grade: "دهم الف", birthday: "1404-09-08", isVisible: true },
      { firstName: "نرگس", grade: "یازدهم الف", birthday: "1404-11-30", isVisible: true },
      { firstName: "مریم", grade: "یازدهم ب", birthday: "1404-02-14", isVisible: true },
      { firstName: "سارا", grade: "یازدهم الف", birthday: "1404-07-19", isVisible: true },
      { firstName: "النا", grade: "دوازدهم الف", birthday: "1404-01-05", isVisible: true },
      { firstName: "یاسمن", grade: "دوازدهم ب", birthday: "1404-04-28", isVisible: true },
    ];

    for (const b of birthdaysData) {
      await ctx.db.insert("birthdays", { ...b, createdAt: now });
    }

    // ── News ──
    const newsData = [
      { title: "موفقیت دانش‌آموزان مدرسه در المپیاد علمی کشور", slug: "olympiad-success", excerpt: "سه نفر از دانش‌آموزان مدرسه در المپیاد علمی کشوری موفق به کسب رتبه برتر شدند.", content: "در المپیاد علمی کشوری که امسال برگزار شد، سه نفر از دانش‌آموزان دبیرستان دخترانه شاهد حضرت خدیجه (ص) موفق به کسب رتبه‌های برتر شدند. زهرا احمدی در رشته ریاضی، فاطمه حسینی در رشته شیمی و نرگس محمدی در رشته فیزیک افتخارات ارزشمندی برای مدرسه کسب کردند.", coverImage: undefined, author: "روابط عمومی مدرسه", category: "علمی", isFeatured: true, isActive: true },
      { title: "کارگاه آموزشی مهارت‌های زندگی برای دانش‌آموزان", slug: "life-skills-workshop", excerpt: "کارگاه تخصصی مهارت‌های زندگی ویژه دانش‌آموزان پایه دهم و یازدهم برگزار شد.", content: "این کارگاه با هدف تقویت مهارت‌های ارتباطی، مدیریت زمان و هوش هیجانی دانش‌آموزان برگزار شد.", author: "مریم رضایی - مشاور مدرسه", category: "آموزشی", isFeatured: false, isActive: true },
      { title: "بازدید علمی از پژوهشگاه شهید رضایی", slug: "research-visit", excerpt: "دانش‌آموزان پایه یازدهم از پژوهشگاه شهید رضایی بازدید کردند.", content: "در این بازدید علمی، دانش‌آموزان با آخرین دستاوردهای علمی و تحقیقاتی آشنا شدند.", author: "روابط عمومی مدرسه", category: "علمی", isFeatured: false, isActive: true },
      { title: "جشن فارغ‌التحصیلی دانش‌آموزان پایه دوازدهم", slug: "graduation-ceremony", excerpt: "مراسم باشکوه فارغ‌التحصیلی دانش‌آموزان پایه دوازدهم برگزار شد.", content: "مراسم فارغ‌التحصیلی با حضور خانواده‌ها و مسئولین مدرسه برگزار شد.", author: "روابط عمومی مدرسه", category: "مراسم", isFeatured: true, isActive: true },
    ];

    for (const n of newsData) {
      await ctx.db.insert("news", { ...n, createdAt: now });
    }

    // ── Courses ──
    const coursesData = [
      { title: "دوره تقویتی ریاضیات پایه دهم", slug: "math-10", description: "دوره جامع تقویتی ریاضیات شامل جبر، هندسه و آمار", fullDescription: "این دوره به صورت هفتگی برگزار شده و شامل تمرینات عملی و آزمون‌های میان‌ترم است.", instructor: "زهرا - دبیر ریاضی", startDate: "2026-10-01", endDate: "2027-02-28", schedule: "شنبه‌ها و دوشنبه‌ها ساعت ۱۴:۰۰", duration: "۵ ماه", capacity: 25, currentRegistrations: 18, status: "ثبت‌نام فعال", category: "تقویتی", gradeLevel: "دهم", registrationDeadline: "2026-09-30", isActive: true },
      { title: "دوره آمادگی المپیاد ریاضی", slug: "math-olympiad", description: "دوره تخصصی آمادگی برای المپیاد ریاضی", fullDescription: "این دوره ویژه دانش‌آموزان مستعد ریاضی طراحی شده و شامل مباحث پیشرفته ریاضی است.", instructor: "فاطمه - دبیر ریاضی", startDate: "2026-10-15", endDate: "2027-03-15", schedule: "چهارشنبه‌ها ساعت ۱۵:۰۰", duration: "۵ ماه", capacity: 15, currentRegistrations: 14, status: "نزدیک به تکمیل ظرفیت", category: "المپیاد", gradeLevel: "دهم و یازدهم", registrationDeadline: "2026-10-10", isActive: true },
      { title: "کارگاه نویسندگی خلاق", slug: "creative-writing", description: "کارگاه مهارت نویسندگی خلاقانه به زبان فارسی", instructor: "مهدیه - دبیر ادبیات", startDate: "2026-10-20", endDate: "2027-01-20", schedule: "پنجشنبه‌ها ساعت ۱۰:۰۰", duration: "۳ ماه", capacity: 20, currentRegistrations: 20, status: "تکمیل ظرفیت", category: "مهارتی", gradeLevel: "همه پایه‌ها", isActive: true },
      { title: "دوره زبان انگلیسی مکالمه", slug: "english-conversation", description: "تقویت مهارت مکالمه زبان انگلیسی با تمرین‌های تعاملی", instructor: "نرگس - دبیر زبان", startDate: "2026-11-01", endDate: "2027-02-01", schedule: "سه‌شنبه‌ها ساعت ۱۴:۰۰", duration: "۳ ماه", capacity: 18, currentRegistrations: 12, status: "ثبت‌نام فعال", category: "زبان", gradeLevel: "همه پایه‌ها", registrationDeadline: "2026-10-25", isActive: true },
    ];

    for (const c of coursesData) {
      await ctx.db.insert("courses", { ...c, createdAt: now });
    }

    return "seeded";
  },
});
