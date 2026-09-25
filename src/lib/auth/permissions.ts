export const PERMISSIONS = [
  { key: "students.view", name: "مشاهده دانش‌آموزان", group: "دانش‌آموزان" },
  { key: "students.create", name: "افزودن دانش‌آموز", group: "دانش‌آموزان" },
  { key: "students.edit", name: "ویرایش دانش‌آموز", group: "دانش‌آموزان" },
  { key: "students.manage_status", name: "فعال/غیرفعال کردن دانش‌آموز", group: "دانش‌آموزان" },

  { key: "staff.view", name: "مشاهده کادر", group: "کادر مدرسه" },
  { key: "staff.create", name: "افزودن عضو کادر", group: "کادر مدرسه" },
  { key: "staff.edit", name: "ویرایش عضو کادر", group: "کادر مدرسه" },
  { key: "staff.manage_status", name: "فعال/غیرفعال کردن عضو کادر", group: "کادر مدرسه" },

  { key: "courses.view", name: "مشاهده دوره‌ها", group: "دوره‌ها" },
  { key: "courses.create", name: "افزودن دوره", group: "دوره‌ها" },
  { key: "courses.edit", name: "ویرایش دوره", group: "دوره‌ها" },
  { key: "courses.manage", name: "مدیریت دوره‌ها", group: "دوره‌ها" },

  { key: "registrations.view", name: "مشاهده ثبت‌نام‌ها", group: "ثبت‌نام" },
  { key: "registrations.manage", name: "مدیریت ثبت‌نام‌ها", group: "ثبت‌نام" },
  { key: "admissions.view", name: "مشاهده پیش‌ثبت‌نام‌ها", group: "پیش‌ثبت‌نام" },
  { key: "admissions.manage", name: "مدیریت پیش‌ثبت‌نام‌ها", group: "پیش‌ثبت‌نام" },

  { key: "news.view", name: "مشاهده اخبار", group: "محتوا" },
  { key: "news.create", name: "افزودن خبر", group: "محتوا" },
  { key: "news.edit", name: "ویرایش خبر", group: "محتوا" },
  { key: "news.manage", name: "مدیریت اخبار", group: "محتوا" },

  { key: "events.view", name: "مشاهده رویدادها", group: "محتوا" },
  { key: "events.manage", name: "مدیریت رویدادها", group: "محتوا" },
  { key: "announcements.view", name: "مشاهده اطلاعیه‌ها", group: "محتوا" },
  { key: "announcements.manage", name: "مدیریت اطلاعیه‌ها", group: "محتوا" },
  { key: "top_students.manage", name: "مدیریت دانش‌آموزان برتر", group: "محتوا" },
  { key: "birthdays.manage", name: "مدیریت تولدها", group: "محتوا" },

  { key: "messages.view", name: "مشاهده پیام‌ها", group: "ارتباطات" },
  { key: "messages.manage", name: "مدیریت پیام‌ها", group: "ارتباطات" },

  { key: "programs.manage", name: "مدیریت برنامه‌های آموزشی", group: "آموزش" },
  { key: "videos.view", name: "مشاهده ویدیوهای آموزشی", group: "آموزش" },
  { key: "videos.create", name: "افزودن ویدیو آموزشی", group: "آموزش" },
  { key: "videos.edit_own", name: "ویرایش ویدیوهای خود", group: "آموزش" },
  { key: "videos.edit_all", name: "ویرایش همه ویدیوها", group: "آموزش" },
  { key: "videos.delete_own", name: "حذف ویدیوهای خود", group: "آموزش" },
  { key: "videos.delete_all", name: "حذف همه ویدیوها", group: "آموزش" },

  { key: "users.view", name: "مشاهده کاربران", group: "کاربران و دسترسی‌ها" },
  { key: "users.create", name: "ایجاد کاربر", group: "کاربران و دسترسی‌ها" },
  { key: "users.edit", name: "ویرایش کاربر", group: "کاربران و دسترسی‌ها" },
  { key: "users.manage_permissions", name: "مدیریت دسترسی‌ها", group: "کاربران و دسترسی‌ها" },

  { key: "settings.manage", name: "مدیریت تنظیمات مدرسه", group: "تنظیمات" },
] as const;

export const ROLE_DEFAULT_PERMISSION_KEYS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: PERMISSIONS.map((permission) => permission.key),
  SCHOOL_ADMIN: PERMISSIONS.map((permission) => permission.key),
  CONTENT_MANAGER: [
    "news.view", "news.create", "news.edit", "news.manage",
    "events.view", "events.manage",
    "announcements.view", "announcements.manage",
    "top_students.manage", "birthdays.manage",
    "messages.view", "messages.manage",
    "programs.manage",
    "videos.view", "videos.create", "videos.edit_own", "videos.delete_own",
  ],
  TEACHER: [
    "students.view",
    "courses.view",
    "registrations.view",
    "videos.view", "videos.create", "videos.edit_own", "videos.delete_own",
  ],
  STAFF: [
    "students.view",
    "staff.view",
    "courses.view",
    "registrations.view",
    "admissions.view",
    "news.view",
    "events.view",
    "announcements.view",
    "messages.view",
  ],
};

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];
