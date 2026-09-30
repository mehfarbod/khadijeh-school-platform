import { BookOpen, Mail, MapPin, Phone, Video } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

type Settings = {
  footerTitle: string;
  footerDescription: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  eitaaUrl: string | null;
  baleUrl: string | null;
  skyroomUrl: string | null;
};

const fallback: Settings = {
  footerTitle: "شاهد حضرت خدیجه (س)",
  footerDescription: "دبیرستان دخترانه شاهد حضرت خدیجه (س) با هدف پرورش استعدادهای علمی و مهارتی دانش‌آموزان.",
  phone: "۰۲۱-۱۲۳۴۵۶۷۸",
  email: "info@khadijeh-school.ir",
  address: "تهران، خیابان آموزش، کوچه مدرسه",
  eitaaUrl: null,
  baleUrl: null,
  skyroomUrl: null,
};

const socialLogoSrc: Record<string, string> = {
  "ایتا": "https://raw.githubusercontent.com/aasaam/brand-icons/master/svg/ir_eitaa.svg",
  "بله": "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/bale.svg",
};

export default async function Footer() {
  const queryStart = performance.now();
  const settings = await prisma.schoolSettings.findUnique({
    where: { id: "school-settings" },
    select: {
      footerTitle: true,
      footerDescription: true,
      phone: true,
      email: true,
      address: true,
      eitaaUrl: true,
      baleUrl: true,
      skyroomUrl: true,
    },
  })

  console.log(
    `[Home] Footer Prisma: ${(performance.now() - queryStart).toFixed(0)}ms`,
  );;

  const currentSettings: Settings = {
    footerTitle: settings?.footerTitle || fallback.footerTitle,
    footerDescription: settings?.footerDescription || fallback.footerDescription,
    phone: settings?.phone ?? fallback.phone,
    email: settings?.email ?? fallback.email,
    address: settings?.address ?? fallback.address,
    eitaaUrl: settings?.eitaaUrl ?? fallback.eitaaUrl,
    baleUrl: settings?.baleUrl ?? fallback.baleUrl,
    skyroomUrl: settings?.skyroomUrl ?? fallback.skyroomUrl,
  };

  const socials = [
    ["ایتا", currentSettings.eitaaUrl],
    ["بله", currentSettings.baleUrl],
    ["اسکای‌روم", currentSettings.skyroomUrl],
  ].filter(([, url]) => Boolean(url)) as [string, string][];

  return (
    <footer className="border-t border-[#E1E8D6] bg-[#F1F5E8] text-[#194342]">
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBE7C1]">
              <BookOpen className="h-5 w-5 text-[#194342]" />
            </div>
            <h2 className="text-[15px] font-bold text-[#194342]">{currentSettings.footerTitle}</h2>
          </div>

          <p className="mt-4 max-w-[330px] text-[12.5px] leading-[1.9] text-[#667085]">
            {currentSettings.footerDescription}
          </p>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-[#194342]">دسترسی سریع</h3>
          <nav className="mt-4 flex flex-col gap-3">
            <Link href="/courses" className="text-[12.5px] text-[#667085] hover:text-[#B86F5B]">دوره‌ها</Link>
            <Link href="/programs" className="text-[12.5px] text-[#667085] hover:text-[#B86F5B]">برنامه‌های آموزشی</Link>
            <Link href="/gallery" className="text-[12.5px] text-[#667085] hover:text-[#B86F5B]">گالری</Link>
            <Link href="/about" className="text-[12.5px] text-[#667085] hover:text-[#B86F5B]">درباره‌ی ما</Link>
          </nav>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-[#194342]">تماس با ما</h3>
          <div className="mt-4 space-y-3">
            {currentSettings.address && (
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-[12.5px] leading-6 text-[#667085]">{currentSettings.address}</span>
              </div>
            )}
            {currentSettings.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0" />
                <span dir="ltr" className="text-[12.5px] text-[#667085]">{currentSettings.phone}</span>
              </div>
            )}
            {currentSettings.email && (
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-[12.5px] text-[#667085]">{currentSettings.email}</span>
              </div>
            )}

            {socials.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socials.map(([label, url]) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DBE7C1] transition hover:bg-[#C9DDA8]"
                  >
                    {socialLogoSrc[label] ? (
                      <img
                        src={socialLogoSrc[label]}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        decoding="async"
                        width="20"
                        height="20"
                        className="h-5 w-5 object-contain"
                      />
                    ) : (
                      <Video className="h-5 w-5 text-[#194342]" />
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E1E8D6]">
        <div className="mx-auto max-w-[1200px] px-6 py-5 text-center">
          <p className="text-[11.5px] text-[#667085]">© ۱۴۰۵ {currentSettings.footerTitle} — تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
