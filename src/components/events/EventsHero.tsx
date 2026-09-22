export default function EventsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#194342]">
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />
      <div className="absolute -left-20 bottom-[-100px] h-72 w-72 rounded-full border border-white/10" />
      <div className="absolute right-1/3 top-10 h-32 w-32 rounded-full border border-white/5" />

      <div className="relative mx-auto flex min-h-[280px] max-w-6xl items-center px-5 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-[#DBE7C1]/30 bg-[#DBE7C1]/10 px-3 py-1.5 text-[11px] font-medium text-[#DBE7C1]">
            شاهد حضرت خدیجه (س)
          </span>

          <h1 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">
            رویدادهای مدرسه
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            برنامه‌ها، مناسبت‌ها و رویدادهای پیش‌روی مدرسه را در این بخش دنبال کنید.
          </p>
        </div>
      </div>
    </section>
  );
}