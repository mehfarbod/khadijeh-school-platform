export default function StudentPortalLoading() {
  return (
    <main className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 sm:py-8" dir="rtl">
      <div className="mx-auto w-full max-w-6xl space-y-6" aria-busy="true" aria-label="در حال بارگذاری پرتال دانش‌آموز">
        <div className="animate-pulse rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-[0_10px_35px_rgba(26,35,50,0.05)] sm:p-6">
          <div className="h-10 w-3/5 rounded-xl bg-[#F1F5E8] sm:w-1/3" />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-11 rounded-xl bg-[#F6F4F0]" />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-2xl border border-[#E7E2DA] bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
