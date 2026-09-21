import { ExternalLink, MapPin } from "lucide-react";

export default function SchoolLocation() {
  return (
    <section className="bg-[#FAF8F3] pb-14 sm:pb-16 lg:pb-20">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-6">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold tracking-wide text-[#B86F5B]">
            موقعیت مدرسه
          </p>

          <h2 className="text-2xl font-bold leading-[1.6] text-[#194342]">
            ما را روی نقشه پیدا کنید
          </h2>

          <p className="mt-3 max-w-[620px] text-[13px] leading-7 text-[#667085]">
            برای مراجعه حضوری می‌توانید موقعیت مدرسه را مشاهده کرده و
            مسیر دسترسی خود را پیدا کنید.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[20px] border border-[#DBE7C1] bg-white lg:grid-cols-[1.35fr_0.65fr]">
          {/* Map Placeholder */}
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[#EEF2F7] sm:min-h-[360px]">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute left-[15%] top-[20%] h-px w-[70%] rotate-12 bg-[#B8C4D0]" />
              <div className="absolute left-[5%] top-[55%] h-px w-[90%] -rotate-6 bg-[#B8C4D0]" />
              <div className="absolute left-[30%] top-[5%] h-[90%] w-px rotate-[18deg] bg-[#B8C4D0]" />
              <div className="absolute left-[65%] top-[0%] h-[100%] w-px -rotate-[12deg] bg-[#B8C4D0]" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#194342] text-white shadow-[0_8px_25px_rgba(25,67,66,0.18)]">
                <MapPin className="h-6 w-6" />
              </div>

              <p className="mt-4 text-[13px] font-semibold text-[#194342]">
                موقعیت مدرسه
              </p>

              <p className="mt-1 text-[11px] text-[#667085]">
                نقشه در مرحله اتصال به اطلاعات واقعی مدرسه
              </p>
            </div>
          </div>

          {/* Address Card */}
          <div className="flex flex-col justify-center border-t border-[#DBE7C1] p-6 sm:p-8 lg:border-r lg:border-t-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F1F5E8] text-[#194342]">
              <MapPin className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <h3 className="mt-5 text-[15px] font-bold text-[#194342]">
              آدرس مدرسه
            </h3>

            <p className="mt-3 text-[12.5px] leading-7 text-[#667085]">
              تهران، خیابان نمونه، کوچه مدرسه،
              دبیرستان شاهد حضرت خدیجه (س)
            </p>

            <button
              type="button"
              className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#194342] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#153938]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              مسیریابی تا مدرسه
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}