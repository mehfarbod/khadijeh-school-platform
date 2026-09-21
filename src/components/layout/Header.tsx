"use client";

import Link from "next/link";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  {
    label: "صفحه اصلی",
    href: "/",
  },
];

const programLinks = [
  {
    label: "برنامه هفتگی",
    href: "/programs/weekly",
  },
  {
    label: "برنامه امتحانات",
    href: "/programs/exams",
  },
  {
    label: "تقویم آموزشی",
    href: "/programs/calendar",
  },
];

const videoLinks = [
  {
    label: "پایه دهم",
    href: "/videos?grade=grade-10",
  },
  {
    label: "پایه یازدهم",
    href: "/videos?grade=grade-11",
  },
  {
    label: "پایه دوازدهم",
    href: "/videos?grade=grade-12",
  },
  {
    label: "مشاهده همه ویدیوها",
    href: "/videos",
  },
];

const galleryLinks = [
  {
    label: "همه تصاویر",
    href: "/gallery",
  },
  {
    label: "فعالیت‌های مدرسه",
    href: "/gallery?category=school-activities",
  },
  {
    label: "مراسم و مناسبت‌ها",
    href: "/gallery?category=events",
  },
  {
    label: "اردوها و بازدیدها",
    href: "/gallery?category=trips",
  },
];

function getLinkPath(href: string) {
  return href.split("?")[0];
}

function getLinkQuery(
  href: string
) {
  const query = href.split("?")[1];

  if (!query) {
    return null;
  }

  return new URLSearchParams(query);
}

function isPathActive(
  pathname: string,
  href: string,
  exact = false
) {
  if (exact) {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

function isLinkActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string
) {
  const linkPath = getLinkPath(href);

  if (pathname !== linkPath) {
    return false;
  }

  const linkQuery = getLinkQuery(href);

  // لینک بدون Query
  if (!linkQuery) {
    return (
      Array.from(searchParams.keys()).length ===
      0
    );
  }

  // مقایسه Query Parameters
  const linkEntries = Array.from(
    linkQuery.entries()
  );

  const currentEntries = Array.from(
    searchParams.entries()
  );

  if (
    linkEntries.length !==
    currentEntries.length
  ) {
    return false;
  }

  return linkEntries.every(
    ([key, value]) =>
      searchParams.get(key) === value
  );
}

interface DesktopDropdownProps {
  label: string;
  href: string;
  links: {
    label: string;
    href: string;
  }[];
  pathname: string;
  searchParams: URLSearchParams;
}

function DesktopDropdown({
  label,
  href,
  links,
  pathname,
  searchParams,
}: DesktopDropdownProps) {
  const [open, setOpen] =
    useState(false);

  const parentActive = isPathActive(
    pathname,
    href
  );

  const childActive = links.some(
    (link) =>
      isLinkActive(
        pathname,
        searchParams,
        link.href
      )
  );

  return (
    <div
      className="relative"
      onMouseEnter={() =>
        setOpen(true)
      }
      onMouseLeave={() =>
        setOpen(false)
      }
    >
      <div
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors",
          parentActive || childActive
            ? "text-[#B86F5B]"
            : "text-[#194342] hover:text-[#B86F5B]"
        )}
      >
        <Link
          href={href}
          className="whitespace-nowrap"
        >
          {label}
        </Link>

        <button
          type="button"
          aria-label={`نمایش زیرمنوی ${label}`}
          aria-expanded={open}
          onClick={() =>
            setOpen(
              (value) => !value
            )
          }
          className="flex h-5 w-5 items-center justify-center"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "absolute right-0 top-full z-50 pt-0 transition-all duration-150",
          open
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        )}
      >
        <div className="mt-2 min-w-[190px] overflow-hidden rounded-xl border border-[#E1E8D6] bg-white p-1.5 shadow-[0_12px_30px_rgba(25,67,66,0.10)]">
          {links.map((link) => {
            const active =
              isLinkActive(
                pathname,
                searchParams,
                link.href
              );

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-lg px-3.5 py-2.5 text-[12.5px] transition-colors",
                  active
                    ? "bg-[#F1F5E8] font-medium text-[#B86F5B]"
                    : "text-[#1F2933] hover:bg-[#F1F5E8] hover:text-[#B86F5B]"
                )}
                onClick={() =>
                  setOpen(false)
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface MobileDropdownProps {
  label: string;
  href: string;
  links: {
    label: string;
    href: string;
  }[];
  pathname: string;
  searchParams: URLSearchParams;
  openDropdown: string | null;
  setOpenDropdown: (
    value: string | null
  ) => void;
  setMobileMenuOpen: (
    value: boolean
  ) => void;
}

function MobileDropdown({
  label,
  href,
  links,
  pathname,
  searchParams,
  openDropdown,
  setOpenDropdown,
  setMobileMenuOpen,
}: MobileDropdownProps) {
  const isOpen =
    openDropdown === label;

  const parentActive = isPathActive(
    pathname,
    href
  );

  const childActive = links.some(
    (link) =>
      isLinkActive(
        pathname,
        searchParams,
        link.href
      )
  );

  return (
    <div>
      <div
        className={cn(
          "flex items-center justify-between",
          parentActive || childActive
            ? "text-[#B86F5B]"
            : "text-[#194342]"
        )}
      >
        <Link
          href={href}
          onClick={() => {
            setMobileMenuOpen(false);
            setOpenDropdown(null);
          }}
          className="flex-1 py-2.5 text-sm font-medium"
        >
          {label}
        </Link>

        <button
          type="button"
          aria-label={`نمایش زیرمنوی ${label}`}
          aria-expanded={isOpen}
          onClick={() =>
            setOpenDropdown(
              isOpen ? null : label
            )
          }
          className="flex h-9 w-9 items-center justify-center"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0"
        )}
      >
        <div className="mr-3 border-r border-[#DBE7C1] pr-3">
          {links.map((link) => {
            const active =
              isLinkActive(
                pathname,
                searchParams,
                link.href
              );

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOpenDropdown(null);
                }}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-[12.5px] transition-colors",
                  active
                    ? "bg-[#F1F5E8] font-medium text-[#B86F5B]"
                    : "text-[#667085] hover:bg-[#F1F5E8] hover:text-[#B86F5B]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    openDropdown,
    setOpenDropdown,
  ] = useState<string | null>(null);

  const isActive = (
    href: string,
    exact = false
  ) =>
    isPathActive(
      pathname,
      href,
      exact
    );

  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#E1E8D6] bg-[#F1F5E8]">
      <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center px-5 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          onClick={closeMobileMenu}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#194342]">
            <span className="text-sm font-bold text-[#DBE7C1]">
              خ
            </span>
          </div>

          <div className="hidden sm:block">
            <p className="text-[13px] font-bold text-[#194342]">
              شاهد حضرت خدیجه (س)
            </p>

            <p className="mt-0.5 text-[10px] text-[#667085]">
              دبیرستان دخترانه
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="mx-auto hidden items-center gap-5 lg:flex"
          aria-label="ناوبری اصلی"
        >
          {navLinks.map((link) => {
            const active = isActive(
              link.href,
              link.href === "/"
            );

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap text-sm font-medium transition-colors",
                  active
                    ? "text-[#B86F5B]"
                    : "text-[#194342] hover:text-[#B86F5B]"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* دوره‌ها */}
          <Link
            href="/courses"
            className={cn(
              "whitespace-nowrap text-sm font-medium transition-colors",
              isActive("/courses")
                ? "text-[#B86F5B]"
                : "text-[#194342] hover:text-[#B86F5B]"
            )}
          >
            دوره‌ها
          </Link>

          {/* برنامه‌های آموزشی */}
          <DesktopDropdown
            label="برنامه‌های آموزشی"
            href="/programs"
            links={programLinks}
            pathname={pathname}
            searchParams={searchParams}
          />

          {/* ویدیوهای آموزشی */}
          <DesktopDropdown
            label="ویدیوهای آموزشی"
            href="/videos"
            links={videoLinks}
            pathname={pathname}
            searchParams={searchParams}
          />

          {/* گالری */}
          <DesktopDropdown
            label="گالری"
            href="/gallery"
            links={galleryLinks}
            pathname={pathname}
            searchParams={searchParams}
          />

          {/* درباره ما */}
          <Link
            href="/about"
            className={cn(
              "whitespace-nowrap text-sm font-medium transition-colors",
              isActive("/about")
                ? "text-[#B86F5B]"
                : "text-[#194342] hover:text-[#B86F5B]"
            )}
          >
            درباره‌ی ما
          </Link>

          {/* تماس با ما */}
          <Link
            href="/contact"
            className={cn(
              "whitespace-nowrap text-sm font-medium transition-colors",
              isActive("/contact")
                ? "text-[#B86F5B]"
                : "text-[#194342] hover:text-[#B86F5B]"
            )}
          >
            تماس با ما
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
          <Link
            href="/registration"
            className={cn(
              "flex h-10 items-center justify-center whitespace-nowrap rounded-[10px] px-4 text-[12.5px] font-medium transition-colors",
              isActive("/registration")
                ? "bg-[#A45F4D] text-white"
                : "bg-[#B86F5B] text-white hover:bg-[#A45F4D]"
            )}
          >
            پیش‌ثبت‌نام
          </Link>

          <Link
            href="/auth"
            className={cn(
              "flex h-10 items-center justify-center whitespace-nowrap rounded-[10px] border px-4 text-[12.5px] font-medium transition-colors",
              isActive("/auth")
                ? "border-[#194342] bg-[#194342] text-white"
                : "border-[#194342] bg-transparent text-[#194342] hover:bg-[#194342] hover:text-white"
            )}
          >
            ورود به سامانه
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={
            mobileMenuOpen
              ? "بستن منو"
              : "باز کردن منو"
          }
          aria-expanded={mobileMenuOpen}
          onClick={() =>
            setMobileMenuOpen(
              (value) => !value
            )
          }
          className="mr-auto flex h-10 w-10 items-center justify-center rounded-lg text-[#194342] transition-colors hover:bg-[#DBE7C1]/50 lg:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "overflow-hidden border-t border-[#E1E8D6] bg-[#F1F5E8] transition-all duration-200 lg:hidden",
          mobileMenuOpen
            ? "max-h-[calc(100vh-72px)] opacity-100"
            : "max-h-0 opacity-0"
        )}
      >
        <nav
          className="mx-auto max-h-[calc(100vh-72px)] w-full max-w-[1400px] overflow-y-auto px-5 py-4 sm:px-6"
          aria-label="ناوبری موبایل"
        >
          <div className="flex flex-col gap-1">

            {/* صفحه اصلی */}
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={cn(
                "py-2.5 text-sm font-medium transition-colors",
                isActive("/", true)
                  ? "text-[#B86F5B]"
                  : "text-[#194342]"
              )}
            >
              صفحه اصلی
            </Link>

            {/* دوره‌ها */}
            <Link
              href="/courses"
              onClick={closeMobileMenu}
              className={cn(
                "py-2.5 text-sm font-medium transition-colors",
                isActive("/courses")
                  ? "text-[#B86F5B]"
                  : "text-[#194342]"
              )}
            >
              دوره‌ها
            </Link>

            {/* برنامه‌های آموزشی */}
            <MobileDropdown
              label="برنامه‌های آموزشی"
              href="/programs"
              links={programLinks}
              pathname={pathname}
              searchParams={searchParams}
              openDropdown={openDropdown}
              setOpenDropdown={
                setOpenDropdown
              }
              setMobileMenuOpen={
                setMobileMenuOpen
              }
            />

            {/* ویدیوهای آموزشی */}
            <MobileDropdown
              label="ویدیوهای آموزشی"
              href="/videos"
              links={videoLinks}
              pathname={pathname}
              searchParams={searchParams}
              openDropdown={openDropdown}
              setOpenDropdown={
                setOpenDropdown
              }
              setMobileMenuOpen={
                setMobileMenuOpen
              }
            />

            {/* گالری */}
            <MobileDropdown
              label="گالری"
              href="/gallery"
              links={galleryLinks}
              pathname={pathname}
              searchParams={searchParams}
              openDropdown={openDropdown}
              setOpenDropdown={
                setOpenDropdown
              }
              setMobileMenuOpen={
                setMobileMenuOpen
              }
            />

            {/* درباره ما */}
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className={cn(
                "py-2.5 text-sm font-medium transition-colors",
                isActive("/about")
                  ? "text-[#B86F5B]"
                  : "text-[#194342]"
              )}
            >
              درباره‌ی ما
            </Link>

            {/* تماس با ما */}
            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className={cn(
                "py-2.5 text-sm font-medium transition-colors",
                isActive("/contact")
                  ? "text-[#B86F5B]"
                  : "text-[#194342]"
              )}
            >
              تماس با ما
            </Link>

            {/* Mobile Actions */}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E1E8D6] pt-4">
              <Link
                href="/registration"
                onClick={closeMobileMenu}
                className="flex h-10 items-center justify-center rounded-[10px] bg-[#B86F5B] text-[12.5px] font-medium text-white transition-colors hover:bg-[#A45F4D]"
              >
                پیش‌ثبت‌نام
              </Link>

              <Link
                href="/auth"
                onClick={closeMobileMenu}
                className="flex h-10 items-center justify-center rounded-[10px] border border-[#194342] text-[12.5px] font-medium text-[#194342] transition-colors hover:bg-[#194342] hover:text-white"
              >
                ورود به سامانه
              </Link>
            </div>

          </div>
        </nav>
      </div>
    </header>
  );
}