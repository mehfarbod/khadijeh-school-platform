import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  weekly: "برنامه هفتگی",
  exams: "برنامه امتحانات",
  calendar: "تقویم آموزشی",
  "parents-meetings": "جلسات انجمن اولیا و مربیان",
  "family-counseling": "جلسات مشاوره خانواده",
};

const dayOrder = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl bg-[#FAF8F5] px-5 py-12 text-center text-sm text-[#98A2B3]">{text}</div>;
}

function Info({ icon: Icon, children }: { icon: typeof CalendarDays; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[#667085]">
      <Icon className="h-4 w-4 shrink-0 text-[#194342]" />
      <span>{children}</span>
    </div>
  );
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  const program = await prisma.educationalProgram.findFirst({
    where: { type, isActive: true },
  });

  if (!program) notFound();

  let content: React.ReactNode = null;

  if (type === "weekly") {
    const schedule = await prisma.weeklySchedule.findUnique({
      where: { programId: program.id },
      include: {
        entries: {
          orderBy: [{ className: "asc" }, { day: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!schedule?.isActive) {
      content = <EmptyState text="برنامه هفتگی در حال حاضر منتشر نشده است." />;
    } else if (!schedule.entries.length) {
      content = <EmptyState text="هنوز برنامه هفتگی توسط مدرسه ثبت نشده است." />;
    } else {
      const classes = [...new Set(schedule.entries.map((entry) => entry.className))];

      content = (
        <div className="space-y-6">
          {schedule.imageUrl && (
            <div className="overflow-hidden rounded-2xl border border-[#EEEAE3] bg-[#FAF8F5]">
              <img src={schedule.imageUrl} alt="تصویر برنامه هفتگی" className="mx-auto max-h-[700px] w-full object-contain" />
            </div>
          )}

          {classes.map((className) => {
            const classEntries = schedule.entries.filter((entry) => entry.className === className);
            const days = [...new Set(classEntries.map((entry) => entry.day))].sort((a, b) => {
              const ai = dayOrder.indexOf(a);
              const bi = dayOrder.indexOf(b);
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
            });

            return (
              <section key={className} className="overflow-hidden rounded-2xl border border-[#DBE7C1]">
                <div className="bg-[#F5F8EE] px-5 py-4">
                  <h2 className="text-sm font-bold text-[#194342]">کلاس {className}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[680px] w-full text-right text-xs">
                    <thead className="bg-[#FAF8F3] text-[#667085]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">روز</th>
                        <th className="px-4 py-3 font-semibold">زمان</th>
                        <th className="px-4 py-3 font-semibold">درس</th>
                        <th className="px-4 py-3 font-semibold">دبیر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {days.flatMap((day) =>
                        classEntries
                          .filter((entry) => entry.day === day)
                          .map((entry) => (
                            <tr key={entry.id} className="border-t border-[#EEEAE3]">
                              <td className="px-4 py-3 font-medium text-[#344054]">{entry.day}</td>
                              <td className="px-4 py-3 text-[#667085]">
                                {entry.startTime}{entry.endTime ? ` تا ${entry.endTime}` : ""}
                              </td>
                              <td className="px-4 py-3 font-semibold text-[#1F2933]">{entry.subject}</td>
                              <td className="px-4 py-3 text-[#667085]">{entry.teacher || "—"}</td>
                            </tr>
                          )),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      );
    }
  }

  if (type === "exams") {
    const schedule = await prisma.examSchedule.findUnique({
      where: { programId: program.id },
      include: { entries: { orderBy: [{ date: "asc" }, { time: "asc" }] } },
    });

    if (!schedule?.isActive) {
      content = <EmptyState text="برنامه امتحانات در حال حاضر منتشر نشده است." />;
    } else if (!schedule.entries.length) {
      content = <EmptyState text="هنوز برنامه امتحانات توسط مدرسه ثبت نشده است." />;
    } else {
      content = (
        <div className="overflow-x-auto rounded-2xl border border-[#DBE7C1]">
          <table className="min-w-[720px] w-full text-right text-xs">
            <thead className="bg-[#F5F8EE] text-[#667085]">
              <tr>
                <th className="px-4 py-3 font-semibold">درس</th>
                <th className="px-4 py-3 font-semibold">تاریخ</th>
                <th className="px-4 py-3 font-semibold">ساعت</th>
                <th className="px-4 py-3 font-semibold">پایه</th>
                <th className="px-4 py-3 font-semibold">کلاس</th>
              </tr>
            </thead>
            <tbody>
              {schedule.entries.map((entry) => (
                <tr key={entry.id} className="border-t border-[#EEEAE3]">
                  <td className="px-4 py-3 font-semibold text-[#1F2933]">{entry.subject}</td>
                  <td className="px-4 py-3 text-[#667085]">{entry.date}</td>
                  <td className="px-4 py-3 text-[#667085]">{entry.time || "—"}</td>
                  <td className="px-4 py-3 text-[#667085]">{entry.grade}</td>
                  <td className="px-4 py-3 text-[#667085]">{entry.className || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  if (type === "calendar") {
    const events = await prisma.educationalCalendarEvent.findMany({
      where: { programId: program.id, isActive: true },
      orderBy: { date: "asc" },
    });

    content = events.length ? (
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <article key={event.id} className="rounded-2xl border border-[#DBE7C1] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-[#F5F8EE] px-3 py-1 text-[11px] font-semibold text-[#194342]">{event.eventType}</span>
              <Info icon={CalendarDays}>{event.date}</Info>
            </div>
            <h2 className="mt-4 text-sm font-bold text-[#1F2933]">{event.title}</h2>
            <p className="mt-2 text-xs leading-7 text-[#667085]">{event.description}</p>
            {event.imageUrl && <img src={event.imageUrl} alt="" className="mt-4 max-h-64 w-full rounded-xl object-cover" />}
          </article>
        ))}
      </div>
    ) : <EmptyState text="هنوز رویدادی در تقویم آموزشی ثبت نشده است." />;
  }

  if (type === "parents-meetings") {
    const meetings = await prisma.parentMeeting.findMany({
      where: { programId: program.id, isActive: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    content = meetings.length ? (
      <div className="grid gap-4 md:grid-cols-2">
        {meetings.map((meeting) => (
          <article key={meeting.id} className="rounded-2xl border border-[#DBE7C1] bg-white p-5">
            <Info icon={CalendarDays}>{meeting.date}</Info>
            <h2 className="mt-4 text-sm font-bold text-[#1F2933]">{meeting.title}</h2>
            <div className="mt-3 flex flex-wrap gap-4">
              {meeting.time && <Info icon={Clock3}>{meeting.time}</Info>}
              {meeting.location && <Info icon={MapPin}>{meeting.location}</Info>}
            </div>
            <p className="mt-3 text-xs font-semibold text-[#344054]">موضوع: {meeting.topic}</p>
            {meeting.audience && <p className="mt-2 text-xs text-[#667085]">مخاطبان: {meeting.audience}</p>}
            <p className="mt-3 text-xs leading-7 text-[#667085]">{meeting.description}</p>
            {meeting.imageUrl && <img src={meeting.imageUrl} alt="" className="mt-4 max-h-64 w-full rounded-xl object-cover" />}
          </article>
        ))}
      </div>
    ) : <EmptyState text="هنوز جلسه‌ای برای انجمن اولیا و مربیان ثبت نشده است." />;
  }

  if (type === "family-counseling") {
    const sessions = await prisma.familyCounselingSession.findMany({
      where: { programId: program.id, isActive: true },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    content = sessions.length ? (
      <div className="grid gap-4 md:grid-cols-2">
        {sessions.map((session) => (
          <article key={session.id} className="rounded-2xl border border-[#DBE7C1] bg-white p-5">
            <Info icon={CalendarDays}>{session.date}</Info>
            <h2 className="mt-4 text-sm font-bold text-[#1F2933]">{session.title}</h2>
            <div className="mt-3 flex flex-wrap gap-4">
              {session.time && <Info icon={Clock3}>{session.time}</Info>}
              {session.location && <Info icon={MapPin}>{session.location}</Info>}
              <Info icon={UserRound}>{session.counselor}</Info>
            </div>
            <p className="mt-3 text-xs font-semibold text-[#344054]">موضوع: {session.topic}</p>
            {session.audience && <p className="mt-2 text-xs text-[#667085]">مخاطبان: {session.audience}</p>}
            <p className="mt-3 text-xs leading-7 text-[#667085]">{session.description}</p>
            {session.imageUrl && <img src={session.imageUrl} alt="" className="mt-4 max-h-64 w-full rounded-xl object-cover" />}
          </article>
        ))}
      </div>
    ) : <EmptyState text="هنوز جلسه مشاوره‌ای ثبت نشده است." />;
  }

  return (
    <>
      <Header />
      <main dir="rtl" className="min-h-screen bg-[#FAF8F3] px-5 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-[1100px]">
          <Link href="/programs" className="inline-flex items-center gap-2 text-xs font-semibold text-[#194342]">
            <ArrowRight className="h-4 w-4" /> بازگشت به برنامه‌های آموزشی
          </Link>

          <article className="mt-6 rounded-[22px] border border-[#DBE7C1] bg-white p-6 shadow-[0_12px_40px_rgba(25,67,66,0.06)] sm:p-9">
            <p className="text-xs font-semibold text-[#667085]">{labels[type] ?? program.title}</p>
            <h1 className="mt-3 text-2xl font-bold text-[#194342]">{program.title}</h1>
            <p className="mt-3 text-sm leading-8 text-[#667085]">{program.description}</p>
            {(program.startDate || program.endDate) && (
              <div className="mt-5 text-xs text-[#667085]">
                {program.startDate && <>از {program.startDate}</>}
                {program.endDate && <> تا {program.endDate}</>}
              </div>
            )}
            <div className="mt-7 border-t border-[#EEEAE3] pt-6">{content}</div>
          </article>
        </div>
      </main>
      <CoursesFooter />
    </>
  );
}
