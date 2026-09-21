import { BookOpen, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function CoursesFooter() {
  return (
    <footer className="border-t border-[#E1E8D6] bg-[#F1F5E8] text-[#194342]">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">
        {/* School info */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBE7C1]">
              <BookOpen className="h-5 w-5 text-[#194342]" />
            </div>

            <h2 className="text-[15px] font-bold text-[#194342]">
              شاهد حضرت خدیجه (س)
            </h2>
          </div>

          <p className="mt-4 max-w-[330px] text-[12.5px] leading-[1.9] text-[#667085]">
            دبیرستان دخترانه شاهد حضرت خدیجه (س) با هدف پرورش استعدادهای
            علمی و مهارتی دانش‌آموزان.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-[13px] font-bold text-[#194342]">
            دسترسی سریع
          </h3>

          <nav className="mt-4 flex flex-col gap-3">
            <Link
              href="/courses"
              className="text-[12.5px] text-[#667085] transition-colors hover:text-[#B86F5B]"
            >
              دوره‌ها
            </Link>

            <Link
              href="/programs"
              className="text-[12.5px] text-[#667085] transition-colors hover:text-[#B86F5B]"
            >
              برنامه‌های آموزشی
            </Link>

            <Link
              href="/gallery"
              className="text-[12.5px] text-[#667085] transition-colors hover:text-[#B86F5B]"
            >
              گالری
            </Link>

            <Link
              href="/about"
              className="text-[12.5px] text-[#667085] transition-colors hover:text-[#B86F5B]"
            >
              درباره‌ی ما
            </Link>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-[13px] font-bold text-[#194342]">
            تماس با ما
          </h3>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#194342]" />

              <span className="text-[12.5px] leading-6 text-[#667085]">
                تهران، خیابان آموزش، کوچه مدرسه
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-[#194342]" />

              <span
                dir="ltr"
                className="text-[12.5px] text-[#667085]"
              >
                ۰۲۱-۱۲۳۴۵۶۷۸
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-[#194342]" />

              <span className="text-[12.5px] text-[#667085]">
                info@khadijeh-school.ir
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#E1E8D6]">
        <div className="mx-auto max-w-[1200px] px-6 py-5 text-center">
          <p className="text-[11.5px] text-[#667085]">
            © ۱۴۰۳ دبیرستان شاهد حضرت خدیجه (س) — تمامی حقوق محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}