import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CourseDetailHeroProps {
  title: string;
  description: string;
  status: "active" | "upcoming";
}

export default function CourseDetailHero({
  title,
  description,
  status,
}: CourseDetailHeroProps) {
  const isActive = status === "active";

  return (
    <section className="relative overflow-hidden bg-[#194342]">
      {/* Decorative circles */}
      <div className="absolute -right-[70px] -top-[70px] h-[240px] w-[240px] rounded-full border border-[#DBE7C1]/15" />
      <div className="absolute -right-[35px] -top-[35px] h-[155px] w-[155px] rounded-full border border-[#DBE7C1]/10" />
      <div className="absolute -bottom-[100px] -left-[100px] h-[280px] w-[280px] rounded-full border border-[#DBE7C1]/10" />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-6 sm:py-12">
        {/* Breadcrumb */}
        <Link
          href="/courses"
          className="mb-7 inline-flex items-center gap-2 text-[12px] text-[#DBE7C1]/75 transition-colors hover:text-white"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          بازگشت به دوره‌ها
        </Link>

        {/* Status */}
        <div
          className={
            isActive
              ? "mb-4 inline-flex rounded-full bg-[#DBE7C1]/18 px-3.5 py-1 text-[11.5px] font-medium text-[#DBE7C1]"
              : "mb-4 inline-flex rounded-full border border-[#DBE7C1]/25 bg-white/5 px-3.5 py-1 text-[11.5px] font-medium text-[#DBE7C1]/80"
          }
        >
          {isActive ? "در حال ثبت‌نام" : "به‌زودی"}
        </div>

        {/* Title */}
        <h1 className="max-w-[720px] text-[clamp(26px,5vw,42px)] font-bold leading-[1.45] text-white">
          {title}
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-[650px] text-[13.5px] leading-[1.9] text-[#DBE7C1]/80 sm:text-[15px]">
          {description}
        </p>
      </div>
    </section>
  );
}