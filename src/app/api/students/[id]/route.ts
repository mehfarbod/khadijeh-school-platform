import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireRole } from "@/lib/auth/authorization";
import { jalaliToGregorian } from "@/lib/date/jalali";
import { studentProfileSchema, studentEnrollmentSchema } from "@/lib/validation/student";
import { getCurrentStudentEnrollment } from "@/lib/student-current-grade";

const updateStudentSchema = studentProfileSchema
  .partial()
  .merge(studentEnrollmentSchema.partial())
  .extend({
    classId: z.string().trim().min(1).nullable().optional(),
    photo: z.string().trim().max(2000).nullable().optional(),
    isActive: z.boolean().optional(),
    isBirthdayVisible: z.boolean().optional(),
  });

type RouteContext = { params: Promise<{ id: string }> };

async function resolveClassId(options: {
  classId?: string | null;
  className?: string | null;
  academicYearId: string;
  grade: string;
}) {
  if (options.classId) {
    const classRecord = await prisma.class.findUnique({
      where: { id: options.classId },
      select: { id: true, academicYearId: true, grade: true, isActive: true },
    });

    if (!classRecord) throw new Error("CLASS_NOT_FOUND");
    if (!classRecord.isActive) throw new Error("CLASS_INACTIVE");
    if (classRecord.academicYearId !== options.academicYearId || classRecord.grade !== options.grade) {
      throw new Error("CLASS_MISMATCH");
    }

    return classRecord.id;
  }

  if (options.className?.trim()) {
    const classRecord = await prisma.class.findUnique({
      where: {
        academicYearId_grade_name: {
          academicYearId: options.academicYearId,
          grade: options.grade,
          name: options.className.trim(),
        },
      },
      select: { id: true, isActive: true },
    });

    if (!classRecord) throw new Error("CLASS_NOT_FOUND");
    if (!classRecord.isActive) throw new Error("CLASS_INACTIVE");

    return classRecord.id;
  }

  return null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Teacher access is intentionally read/write-scoped through the grades and
    // assessments APIs. Student profile/enrollment mutations remain management-only.
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("students.edit");

    const { id } = await context.params;
    const result = updateStudentSchema.safeParse(await request.json());

    if (!result.success) {
      return NextResponse.json(
        { error: "اطلاعات واردشده معتبر نیست.", details: result.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = result.data;
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: { academicYear: { select: { isCurrent: true } } },
          orderBy: { academicYear: { title: "desc" } },
        },
      },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "دانش‌آموز موردنظر یافت نشد." }, { status: 404 });
    }

    if (data.academicYearId !== undefined) {
      const academicYear = await prisma.academicYear.findUnique({ where: { id: data.academicYearId } });
      if (!academicYear) {
        return NextResponse.json({ error: "سال تحصیلی انتخاب‌شده یافت نشد." }, { status: 400 });
      }
    }

    const birthday =
      data.birthday !== undefined
        ? data.birthday
          ? new Date(jalaliToGregorian(data.birthday))
          : null
        : undefined;

    const student = await prisma.$transaction(async (tx) => {
      const [lockedStudent] = await tx.$queryRaw<Array<{ nationalId: string | null }>>`
        SELECT "nationalId" FROM "Student" WHERE "id" = ${id} FOR UPDATE
      `;

      if (!lockedStudent) throw new Error("STUDENT_NOT_FOUND");

      const nextNationalId = data.nationalId !== undefined ? data.nationalId || null : undefined;
      const nationalIdChanged =
        nextNationalId !== undefined && nextNationalId !== lockedStudent.nationalId;

      await tx.student.update({
        where: { id },
        data: {
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.nationalId !== undefined && { nationalId: data.nationalId || null }),
          ...(data.birthCertificateSerial !== undefined && { birthCertificateSerial: data.birthCertificateSerial || null }),
          ...(data.mobile !== undefined && { mobile: data.mobile || null }),
          ...(data.photo !== undefined && { photo: data.photo || null }),
          ...(birthday !== undefined && { birthday }),
          ...(data.fatherFirstName !== undefined && { fatherFirstName: data.fatherFirstName || null }),
          ...(data.fatherLastName !== undefined && { fatherLastName: data.fatherLastName || null }),
          ...(data.fatherNationalId !== undefined && { fatherNationalId: data.fatherNationalId || null }),
          ...(data.fatherJob !== undefined && { fatherJob: data.fatherJob || null }),
          ...(data.fatherEducation !== undefined && { fatherEducation: data.fatherEducation || null }),
          ...(data.fatherMobile !== undefined && { fatherMobile: data.fatherMobile || null }),
          ...(data.motherFirstName !== undefined && { motherFirstName: data.motherFirstName || null }),
          ...(data.motherLastName !== undefined && { motherLastName: data.motherLastName || null }),
          ...(data.motherNationalId !== undefined && { motherNationalId: data.motherNationalId || null }),
          ...(data.motherJob !== undefined && { motherJob: data.motherJob || null }),
          ...(data.motherEducation !== undefined && { motherEducation: data.motherEducation || null }),
          ...(data.motherMobile !== undefined && { motherMobile: data.motherMobile || null }),
          ...(data.address !== undefined && { address: data.address || null }),
          ...(data.landline !== undefined && { landline: data.landline || null }),
          ...(data.description !== undefined && { description: data.description || null }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.isBirthdayVisible !== undefined && { isBirthdayVisible: data.isBirthdayVisible }),
        },
      });

      if (nationalIdChanged) {
        const currentAccount = await tx.studentAccount.findUnique({
          where: { studentId: id },
          select: { mustChangePassword: true },
        });

        if (currentAccount) {
          await tx.studentAccount.update({
            where: { studentId: id },
            data: {
              sessionVersion: { increment: 1 },
              ...(currentAccount.mustChangePassword ? { passwordHash: null } : {}),
            },
          });
        }
      }

      const enrollmentChanged =
        data.academicYearId !== undefined ||
        data.grade !== undefined ||
        data.className !== undefined ||
        data.classId !== undefined;

      if (enrollmentChanged) {
        const currentEnrollment = getCurrentStudentEnrollment(existingStudent.enrollments);
        const academicYearId = data.academicYearId ?? currentEnrollment?.academicYearId;
        if (!academicYearId) throw new Error("CURRENT_STUDENT_ENROLLMENT_NOT_FOUND");

        const existingEnrollment = existingStudent.enrollments.find(
          (enrollment) => enrollment.academicYearId === academicYearId,
        );

        if (!existingEnrollment && data.grade === undefined) {
          throw new Error("STUDENT_ENROLLMENT_GRADE_REQUIRED");
        }

        const grade = data.grade ?? existingEnrollment?.grade ?? currentEnrollment?.grade;
        if (!grade) throw new Error("STUDENT_ENROLLMENT_GRADE_REQUIRED");

        let classId: string | null | undefined = undefined;

        if (data.classId !== undefined || data.className !== undefined) {
          if (data.classId === null && !data.className?.trim()) {
            throw new Error("STUDENT_CLASS_REQUIRED");
          }

          classId = await resolveClassId({
            classId: data.classId,
            className: data.className,
            academicYearId,
            grade,
          });

          if (!classId) throw new Error("STUDENT_CLASS_REQUIRED");
        }

        if (!existingEnrollment && classId === undefined) {
          throw new Error("STUDENT_CLASS_REQUIRED");
        }

        await tx.studentEnrollment.upsert({
          where: { studentId_academicYearId: { studentId: id, academicYearId } },
          update: {
            ...(data.grade !== undefined && { grade: data.grade }),
            ...(data.className !== undefined && { className: data.className || null }),
            ...(classId !== undefined && { classId }),
          },
          create: {
            studentId: id,
            academicYearId,
            grade,
            className: data.className ?? existingEnrollment?.className ?? null,
            classId: classId ?? existingEnrollment?.classId ?? null,
          },
        });
      }

      return tx.student.findUnique({
        where: { id },
        include: {
          enrollments: {
            include: { academicYear: true, class: true },
            orderBy: { academicYear: { title: "desc" } },
          },
        },
      });
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("PATCH /api/students/[id] error:", error);

    const messages: Record<string, string> = {
      UNAUTHORIZED: "احراز هویت الزامی است.",
      FORBIDDEN: "شما مجوز انجام این عملیات را ندارید.",
      STUDENT_NOT_FOUND: "دانش‌آموز موردنظر یافت نشد.",
      CURRENT_STUDENT_ENROLLMENT_NOT_FOUND: "ثبت‌نام تحصیلی دانش‌آموز برای سال تحصیلی جاری پیدا نشد.",
      STUDENT_ENROLLMENT_GRADE_REQUIRED: "برای ایجاد ثبت‌نام تحصیلی در سال جدید، پایه تحصیلی الزامی است.",
      STUDENT_CLASS_REQUIRED: "برای ثبت یا تغییر ثبت‌نام تحصیلی، انتخاب یک کلاس فعال الزامی است.",
      CLASS_NOT_FOUND: "کلاس انتخاب‌شده یافت نشد. ابتدا کلاس را در مدیریت کلاس‌ها تعریف کنید.",
      CLASS_INACTIVE: "کلاس انتخاب‌شده غیرفعال است.",
      CLASS_MISMATCH: "کلاس انتخاب‌شده با سال تحصیلی یا پایه دانش‌آموز سازگار نیست.",
    };

    if (error instanceof Error && messages[error.message]) {
      const status = error.message === "UNAUTHORIZED" ? 401 : error.message === "FORBIDDEN" ? 403 : error.message === "STUDENT_NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: messages[error.message] }, { status });
    }

    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "دانش‌آموزی با این کد ملی قبلاً در سیستم ثبت شده است." }, { status: 409 });
    }

    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "اطلاعات موردنظر پیدا نشد." }, { status: 404 });
    }

    return NextResponse.json({ error: "خطا در ویرایش اطلاعات دانش‌آموز" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole(["SUPER_ADMIN", "SCHOOL_ADMIN"]);
    await requirePermission("students.manage_status");
    const { id } = await context.params;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return NextResponse.json({ error: "دانش‌آموز موردنظر یافت نشد." }, { status: 404 });

    await prisma.student.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/students/[id] error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "احراز هویت الزامی است." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "شما مجوز انجام این عملیات را ندارید." }, { status: 403 });
    }

    return NextResponse.json({ error: "خطا در غیرفعال‌سازی دانش‌آموز" }, { status: 500 });
  }
}
