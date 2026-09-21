export default function AboutHero() {
  return (
    <section
      className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-[#194342]"
      aria-labelledby="about-hero-title"
    >
      <div className="absolute -right-[60px] -top-[60px] h-[220px] w-[220px] rounded-full border border-[#DBE7C1]/15" />
      <div className="absolute -right-[30px] -top-[30px] h-[140px] w-[140px] rounded-full border border-[#DBE7C1]/10" />
      <div className="absolute -bottom-[80px] -left-[80px] h-[260px] w-[260px] rounded-full border border-[#DBE7C1]/10" />

      <div className="relative z-10 w-full px-5 py-10 text-center sm:px-6">
        <div className="mb-[18px] inline-flex items-center rounded-full border border-[#DBE7C1]/30 bg-[#DBE7C1]/[0.18] px-3.5 py-1">
          <span className="text-xs font-medium text-[#DBE7C1]">
            شاهد حضرت خدیجه (س)
          </span>
        </div>

        <h1
          id="about-hero-title"
          className="mb-3.5 text-[clamp(24px,8vw,38px)] font-bold leading-[1.4] text-white"
        >
          درباره‌ی مدرسه
        </h1>

        <p className="mx-auto max-w-[540px] text-[13px] leading-[1.9] text-[#DBE7C1]/85 sm:text-[15px]">
          آشنایی با مدرسه، رویکرد آموزشی و ارزش‌هایی که مسیر رشد دانش‌آموزان را شکل می‌دهند.
        </p>
      </div>
    </section>
  );
}