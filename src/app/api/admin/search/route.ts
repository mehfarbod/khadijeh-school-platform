import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, hasPermission } from "@/lib/auth/authorization";

type AdminSearchResult = {
  type: string;
  label: string;
  title: string;
  description: string;
  href: string;
};

const resources = [
  ["students.view", "دانش‌آموز", "students"],
  ["staff.view", "کادر مدرسه", "staff"],
  ["news.view", "خبر", "news"],
  ["events.view", "رویداد", "events"],
  ["announcements.view", "اطلاعیه", "announcements"],
  ["courses.view", "دوره", "courses"],
  ["registrations.view", "ثبت‌نام دوره", "registrations"],
  ["admissions.view", "پیش‌ثبت‌نام مدرسه", "admissions"],
  ["videos.view", "ویدیوی آموزشی", "videos"],
  ["top_students.manage", "دانش‌آموز برتر", "top-students"],
  ["birthdays.manage", "تولد", "birthdays"],
  ["messages.view", "پیام", "messages"],
] as const;

function normalizeQuery(value: string) {
  return value
    .trim()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u200d]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100);
}

function variants(query: string) {
  return [...new Set([query, query.replace(/ی/g, "ي").replace(/ک/g, "ك")])];
}

function errorResponse(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
  }

  if (error instanceof Error && error.message === "FORBIDDEN") {
    return NextResponse.json({ error: "شما مجوز جست‌وجو ندارید." }, { status: 403 });
  }

  console.error("GET /api/admin/search error:", error);
  return NextResponse.json({ error: "خطا در جست‌وجوی پنل مدیریت" }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session?.user?.id) {
      throw new Error("UNAUTHORIZED");
    }

    const query = normalizeQuery(new URL(request.url).searchParams.get("q") ?? "");

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const allowed = new Set(
      (
        await Promise.all(
          resources.map(async ([permission]) => [
            permission,
            await hasPermission(session.user.id, permission),
          ] as const),
        )
      )
        .filter(([, value]) => value)
        .map(([permission]) => permission),
    );

    const values = variants(query);
    const contains = (field: string) =>
      values.map((value) => ({
        [field]: { contains: value, mode: "insensitive" as const },
      }));

    const results: AdminSearchResult[] = [];

    if (allowed.has("students.view")) {
      const rows = await prisma.student.findMany({
        where: {
          OR: [
            ...contains("firstName"),
            ...contains("lastName"),
            ...contains("nationalId"),
            ...contains("mobile"),
          ],
        },
        select: { id: true, firstName: true, lastName: true, isActive: true },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 8,
      });
      results.push(
        ...rows.map((row) => ({
          type: "students",
          label: row.isActive ? "دانش‌آموز" : "دانش‌آموز غیرفعال",
          title: `${row.firstName} ${row.lastName}`,
          description: "پرونده دانش‌آموز",
          href: `/admin/students/${row.id}`,
        })),
      );
    }

    if (allowed.has("staff.view")) {
      const rows = await prisma.staff.findMany({
        where: {
          OR: [
            ...contains("firstName"),
            ...contains("lastName"),
            ...contains("position"),
            ...contains("subject"),
            ...contains("email"),
            ...contains("phone"),
          ],
        },
        select: { id: true, firstName: true, lastName: true, position: true },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: 6,
      });
      results.push(
        ...rows.map((row) => ({
          type: "staff",
          label: "کادر مدرسه",
          title: `${row.firstName} ${row.lastName}`,
          description: row.position,
          href: `/admin/staff?edit=${row.id}`,
        })),
      );
    }

    if (allowed.has("news.view")) {
      const rows = await prisma.news.findMany({
        where: { OR: [...contains("title"), ...contains("excerpt"), ...contains("content")] },
        select: { id: true, title: true, category: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "news", label: "خبر", title: row.title, description: row.category,
        href: `/admin/news?edit=${row.id}`,
      })));
    }

    if (allowed.has("events.view")) {
      const rows = await prisma.event.findMany({
        where: { OR: [...contains("title"), ...contains("description"), ...contains("location")] },
        select: { id: true, title: true, eventType: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "events", label: "رویداد", title: row.title, description: row.eventType,
        href: `/admin/events?edit=${row.id}`,
      })));
    }

    if (allowed.has("announcements.view")) {
      const rows = await prisma.announcement.findMany({
        where: { OR: [...contains("title"), ...contains("content")] },
        select: { id: true, title: true, category: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "announcements", label: "اطلاعیه", title: row.title, description: row.category,
        href: `/admin/announcements?edit=${row.id}`,
      })));
    }

    if (allowed.has("courses.view")) {
      const rows = await prisma.course.findMany({
        where: { OR: [...contains("title"), ...contains("description"), ...contains("category")] },
        select: { id: true, title: true, category: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "courses", label: "دوره", title: row.title, description: row.category,
        href: `/admin/courses?edit=${row.id}`,
      })));
    }

    if (allowed.has("registrations.view")) {
      const rows = await prisma.courseRegistration.findMany({
        where: {
          OR: [
            ...contains("studentFirstName"),
            ...contains("studentLastName"),
            ...contains("email"),
            ...contains("notes"),
          ],
        },
        select: { id: true, studentFirstName: true, studentLastName: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "registrations", label: "ثبت‌نام دوره",
        title: `${row.studentFirstName} ${row.studentLastName}`,
        description: `وضعیت: ${row.status}`,
        href: `/admin/registrations?edit=${row.id}`,
      })));
    }

    if (allowed.has("admissions.view")) {
      const rows = await prisma.admissionApplication.findMany({
        where: {
          OR: [
            ...contains("studentFirstName"),
            ...contains("studentLastName"),
            ...contains("nationalId"),
            ...contains("studentMobile"),
            ...contains("fatherFirstName"),
            ...contains("fatherLastName"),
            ...contains("motherFirstName"),
            ...contains("motherLastName"),
          ],
        },
        select: { id: true, studentFirstName: true, studentLastName: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "admissions", label: "پیش‌ثبت‌نام مدرسه",
        title: `${row.studentFirstName} ${row.studentLastName}`,
        description: `وضعیت: ${row.status}`,
        href: `/admin/admission-applications?edit=${row.id}`,
      })));
    }

    if (allowed.has("videos.view")) {
      const rows = await prisma.educationalVideo.findMany({
        where: { OR: [...contains("title"), ...contains("subject"), ...contains("instructor")] },
        select: { id: true, title: true, subject: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "videos", label: "ویدیوی آموزشی", title: row.title, description: row.subject,
        href: `/admin/videos?edit=${row.id}`,
      })));
    }

    if (allowed.has("top_students.manage")) {
      const rows = await prisma.topStudent.findMany({
        where: { OR: [...contains("firstName"), ...contains("lastName"), ...contains("achievement"), ...contains("academicYear")] },
        select: { id: true, firstName: true, lastName: true, achievement: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "top-students", label: "دانش‌آموز برتر",
        title: `${row.firstName} ${row.lastName}`, description: row.achievement,
        href: `/admin/top-students?edit=${row.id}`,
      })));
    }

    if (allowed.has("birthdays.manage")) {
      const rows = await prisma.birthday.findMany({
        where: { OR: [...contains("firstName"), ...contains("grade"), ...contains("birthday")] },
        select: { id: true, firstName: true, grade: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "birthdays", label: "تولد",
        title: row.firstName, description: `پایه ${row.grade}`,
        href: `/admin/birthdays?edit=${row.id}`,
      })));
    }

    if (allowed.has("messages.view")) {
      const rows = await prisma.contactMessage.findMany({
        where: { OR: [...contains("name"), ...contains("phone"), ...contains("email"), ...contains("subject"), ...contains("message")] },
        select: { id: true, name: true, subject: true, isRead: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      results.push(...rows.map((row) => ({
        type: "messages", label: row.isRead ? "پیام" : "پیام جدید",
        title: row.name, description: row.subject || "پیام تماس",
        href: `/admin/messages?message=${row.id}`,
      })));
    }

    return NextResponse.json({ results: results.slice(0, 40) });
  } catch (error) {
    return errorResponse(error);
  }
}
