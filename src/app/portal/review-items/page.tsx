import { redirect } from "next/navigation";
import { AlertCircle, CalendarDays, CheckCircle2, Eye, Info } from "lucide-react";

import { getAuthenticatedStudent } from "@/lib/auth/student-session";
import { prisma } from "@/lib/prisma";
import StudentPortalShell from "@/components/student/StudentPortalShell";

export const metadata = {
  title: "موارد نیازمند بررسی | دبیرستان شاهد حضرت خدیجه (ص)",
};

const typeLabels = { ABSENCE: "غیبت", DISCIPLINE: "انضباطی", GENERAL: "سایر موارد" } as const;
const statusLabels = { OPEN: "نیازمند پیگیری", REVIEWED: "بررسی شده", RESOLVED: "مختومه" } as const;
const statusStyles = {
  OPEN: "bg-[#FDF0EC] text-[#A45F4D]",
  REVIEWED: "bg-[#EEF4FA] text-[#335F85]",
  RESOLVED: "bg-[#F1F5E8] text-[#27745A]",
} as const;
const statusIcons = { OPEN: AlertCircle, REVIEWED: Eye, RESOLVED: CheckCircle2 } as const;

export default async function StudentReviewItemsPage() {
  const student = await getAuthenticatedStudent();

  if (!student) redirect("/portal/login");
  if (student.studentAccount?.mustChangePassword) redirect("/portal/change-password");

  const items = await prisma.studentReviewItem.findMany({
    where: { studentId: student.id, isVisible: true },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      occurredAt: true,
      status: true,
    },
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
  });
  const statusCounts = {
    OPEN: items.filter((item) => item.status === "OPEN").length,
    REVIEWED: items.filter((item) => item.status === "REVIEWED").length,
    RESOLVED: items.filter((item) => item.status === "RESOLVED").length,
  };
  const orderedItems = [...items].sort((first, second) => {
    const priority: Record<string, number> = { OPEN: 0, REVIEWED: 1, RESOLVED: 2 };
    return (priority[first.status] ?? 3) - (priority[second.status] ?? 3);
  });

  return (
    <StudentPortalShell title="موارد نیازمند بررسی" description="غیبت‌ها، موارد انضباطی و پیگیری‌های مدرسه">
      {items.length === 0 ? (
        <section className="rounded-2xl border border-[#E7E2DA] bg-white p-10 text-center shadow-[0_10px_35px_rgba(26,35,50,0.05)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F5E8] text-[#27745A]">
            <CheckCircle2 className="h-7 w-7" strokeWidth={1.7} />
          </div>
          <h2 className="mt-4 font-bold text-[#1A2332]">موردی برای بررسی وجود ندارد</h2>
          <p className="mt-2 text-xs leading-6 text-[#667085]">در حال حاضر غیبت یا مورد دیگری که نیاز به پیگیری شما داشته باشد ثبت نشده است.</p>
        </section>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-3" aria-label="خلاصه وضعیت موارد">
            {(["OPEN", "REVIEWED", "RESOLVED"] as const).map((status) => {
              const StatusIcon = statusIcons[status];

              return (
                <div key={status} className="rounded-xl border border-[#E7E2DA] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-[#667085]">{statusLabels[status]}</span>
                    <StatusIcon className="h-4 w-4 text-[#194342]" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-xl font-bold text-[#1A2332]">{statusCounts[status]}</p>
                </div>
              );
            })}
          </section>

          {orderedItems.map((item) => {
            const isOpen = item.status === "OPEN";
            const Icon = item.type === "DISCIPLINE" ? AlertCircle : item.type === "ABSENCE" ? CalendarDays : Info;
            const status = item.status as keyof typeof statusLabels;
            const StatusIcon = statusIcons[status] ?? Info;

            return (
              <article key={item.id} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-[0_8px_25px_rgba(26,35,50,0.04)]">
                <div className="flex gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isOpen ? "bg-[#FDF0EC] text-[#B86F5B]" : "bg-[#F1F5E8] text-[#27745A]"}`}>
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#98A2B3]">{typeLabels[item.type as keyof typeof typeLabels]}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[status] ?? "bg-[#F3F4F6] text-[#667085]"}`}>
                        <StatusIcon className="h-3 w-3" aria-hidden="true" />
                        {statusLabels[status] ?? "نامشخص"}
                      </span>
                    </div>
                    <h2 className="mt-2 font-semibold text-[#1A2332]">{item.title}</h2>
                    {item.description ? (
                      <div className="mt-3 rounded-xl bg-[#FAF8F5] p-3">
                        <p className="text-[10px] font-semibold text-[#98A2B3]">توضیحات مدرسه</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-7 text-[#667085]">{item.description}</p>
                      </div>
                    ) : null}
                    {isOpen ? (
                      <p className="mt-3 text-xs font-semibold text-[#A45F4D]">
                        این مورد هنوز باز است و نیاز به توجه یا پیگیری شما دارد.
                      </p>
                    ) : null}
                    {item.occurredAt ? (
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[#98A2B3]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium" }).format(item.occurredAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </StudentPortalShell>
  );
}
