"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "صفحه اصلی", href: "/" },
];

const courseLinks = [
  { label: "همه دوره‌ها", href: "/courses" },
  { label: "دوره‌های در حال ثبت‌نام", href: "/courses/registration" },
  { label: "دوره‌های آینده", href: "/courses/upcoming" },
];

const programLinks = [
  { label: "برنامه هفتگی", href: "/programs/weekly" },
  { label: "برنامه امتحانات", href: "/programs/exams" },
  { label: "تقویم آموزشی", href: "/programs/calendar" },
];

const videoLinks = [
  { label: "پایه دهم", href: "/videos/grade-10" },
  { label: "پایه یازدهم", href: "/videos/grade-11" },
  { label: "پایه دوازدهم", href: "/videos/grade-12" },
  { label: "مشاهده همه ویدیوها", href: "/videos" },
];

const galleryLinks = [
  { label: "همه تصاویر", href: "/gallery" },
  { label: "فعالیت‌های مدرسه", href: "/gallery/activities" },
  { label: "مراسم و مناسبت‌ها", href: "/gallery/events" },
  { label: "اردوها و بازدیدها", href: "/gallery/trips" },
];

type DropdownProps = {
  label: string;
  links: { label: string; href: string }[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  pathname: string;
};

function DesktopDropdown({
  label,
  links,
  open,
  onOpen,
  onClose,
  pathname,
}: DropdownProps) {
  const isActive = links.some((link) => pathname.startsWith(link.href));

  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        className={cn(
          "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
          isActive
            ? "text-[#194342]"
            : "text-[#475467] hover:text-[#194342]"
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 pt-2">
          <div className="w-56 overflow-hidden rounded-xl border border-[#E8E3D8] bg-white p-1.5 shadow-[0_10px_35px_rgba(31,41,51,0.10)]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-[#DBE7C1]/40 text-[#194342]"
                    : "text-[#475467] hover:bg-[#FAF8F3] hover:text-[#194342]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const pathname = usePathname() ?? "/";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const toggleDropdown = (name: string) => {
    setOpenDropdown((current) => (current === name ? null : name));
  };

  return (
   <header className="sticky top-0 z-50 w-full border-b border-[#E1E8D6] bg-[#F1F5E8]">
      <div className="mx-auto flex h-[76px] w-full max-w-[1440px] items-center px-5 sm:px-7 lg:px-10 xl:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#194342] text-sm font-bold text-white">
            خ
          </div>

          <div className="hidden sm:block">
            <p className="whitespace-nowrap text-sm font-bold leading-tight text-[#1F2933]">
              دبیرستان شاهد حضرت خدیجه (س)
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-0.5 xl:gap-1">
            {/* Home */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
                  isActive(link.href)
                    ? "text-[#194342]"
                    : "text-[#475467] hover:text-[#194342]"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Courses */}
            <DesktopDropdown
              label="دوره‌ها"
              links={courseLinks}
              pathname={pathname}
              open={openDropdown === "courses"}
              onOpen={() => setOpenDropdown("courses")}
              onClose={() => setOpenDropdown(null)}
            />

            {/* Educational Programs */}
            <DesktopDropdown
              label="برنامه‌های آموزشی"
              links={programLinks}
              pathname={pathname}
              open={openDropdown === "programs"}
              onOpen={() => setOpenDropdown("programs")}
              onClose={() => setOpenDropdown(null)}
            />

            {/* Educational Videos */}
            <DesktopDropdown
              label="ویدیوهای آموزشی"
              links={videoLinks}
              pathname={pathname}
              open={openDropdown === "videos"}
              onOpen={() => setOpenDropdown("videos")}
              onClose={() => setOpenDropdown(null)}
            />

            {/* Gallery */}
            <DesktopDropdown
              label="گالری"
              links={galleryLinks}
              pathname={pathname}
              open={openDropdown === "gallery"}
              onOpen={() => setOpenDropdown("gallery")}
              onClose={() => setOpenDropdown(null)}
            />

            {/* About */}
            <Link
              href="/about"
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
                isActive("/about")
                  ? "text-[#194342]"
                  : "text-[#475467] hover:text-[#194342]"
              )}
            >
              درباره‌ی ما
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
                isActive("/contact")
                  ? "text-[#194342]"
                  : "text-[#475467] hover:text-[#194342]"
              )}
            >
              تماس با ما
            </Link>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2.5">
          {/* Pre-registration */}
          <Link
            href="/registration"
            className="hidden h-10 items-center justify-center whitespace-nowrap rounded-lg bg-[#B86F5B] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#a8614f] sm:inline-flex"
          >
            پیش‌ثبت‌نام
          </Link>

          {/* Login */}
          <Link
            href="/auth"
            className="hidden h-10 min-w-[118px] items-center justify-center whitespace-nowrap rounded-lg bg-[#194342] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#143837] sm:inline-flex"
          >
            ورود به سامانه
          </Link>

          {/* Mobile button */}
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#475467] transition-colors hover:bg-[#DBE7C1]/40 hover:text-[#194342] lg:hidden"
            aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-[#E8E3D8] bg-[#FAF8F3] lg:hidden">
          <nav className="mx-auto max-w-[1440px] px-5 py-4 sm:px-7">
            {/* Home */}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-3 text-sm font-medium",
                isActive("/")
                  ? "bg-[#DBE7C1]/40 text-[#194342]"
                  : "text-[#475467]"
              )}
            >
              صفحه اصلی
            </Link>

            {/* Courses */}
            <MobileDropdown
              label="دوره‌ها"
              links={courseLinks}
              open={openDropdown === "mobile-courses"}
              onToggle={() => toggleDropdown("mobile-courses")}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />

            {/* Educational Programs */}
            <MobileDropdown
              label="برنامه‌های آموزشی"
              links={programLinks}
              open={openDropdown === "mobile-programs"}
              onToggle={() => toggleDropdown("mobile-programs")}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />

            {/* Educational Videos */}
            <MobileDropdown
              label="ویدیوهای آموزشی"
              links={videoLinks}
              open={openDropdown === "mobile-videos"}
              onToggle={() => toggleDropdown("mobile-videos")}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />

            {/* Gallery */}
            <MobileDropdown
              label="گالری"
              links={galleryLinks}
              open={openDropdown === "mobile-gallery"}
              onToggle={() => toggleDropdown("mobile-gallery")}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />

            {/* About */}
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-3 text-sm font-medium",
                isActive("/about")
                  ? "bg-[#DBE7C1]/40 text-[#194342]"
                  : "text-[#475467]"
              )}
            >
              درباره‌ی ما
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-3 text-sm font-medium",
                isActive("/contact")
                  ? "bg-[#DBE7C1]/40 text-[#194342]"
                  : "text-[#475467]"
              )}
            >
              تماس با ما
            </Link>

            {/* Mobile Actions */}
            <div className="mt-3 flex gap-2 border-t border-[#E8E3D8] pt-4">
              <Link
                href="/registration"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-[#B86F5B] px-4 text-sm font-medium text-white"
              >
                پیش‌ثبت‌نام
              </Link>

              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-[#194342] px-4 text-sm font-medium text-white"
              >
                ورود به سامانه
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

type MobileDropdownProps = {
  label: string;
  links: { label: string; href: string }[];
  open: boolean;
  onToggle: () => void;
  pathname: string;
  onNavigate: () => void;
};

function MobileDropdown({
  label,
  links,
  open,
  onToggle,
  pathname,
  onNavigate,
}: MobileDropdownProps) {
  const isActive = links.some((link) => pathname.startsWith(link.href));

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium",
          isActive ? "text-[#194342]" : "text-[#475467]"
        )}
      >
        <span>{label}</span>

        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="mb-1 mr-3 border-r border-[#DBE7C1] pr-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                pathname.startsWith(link.href)
                  ? "bg-[#DBE7C1]/40 text-[#194342]"
                  : "text-[#667085] hover:bg-white hover:text-[#194342]"
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}