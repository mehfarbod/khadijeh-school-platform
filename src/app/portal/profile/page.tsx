import { redirect } from "next/navigation";
import { LockKeyhole, UserRound } from "lucide-react";

import { getAuthenticatedStudent } from "@/lib/auth/student-session";
import { getCurrentStudentEnrollment } from "@/lib/student-current-grade";
import StudentPortalShell from "@/components/student/StudentPortalShell";
import StudentProfileEditForm from "@/components/student/StudentProfileEditForm";

export const metadata = {
  title: "پروفایل دانش‌آموز | دبیرستان شاهد حضرت خدیجه (ص)",
};

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-[#E7E2DA] bg-[#FCFDF9] p-4">
      <p className="text-[11px] text-[#98A2B3]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#344054]">{value || "ثبت نشده"}</p>
    </div>
  );
}

function maskNationalId(nationalId: string | null) {
  return nationalId ? `••••••${nationalId.slice(-4)}` : null;
}

export default async function StudentProfilePage() {
  const student = await getAuthenticatedStudent();

  if (!student) redirect("/portal/login");
  if (student.studentAccount?.mustChangePassword) redirect("/portal/change-password");

  const enrollment = getCurrentStudentEnrollment(student.enrollments);

  return (
    <StudentPortalShell title="پروفایل" description="اطلاعات شخصی، تحصیلی و اطلاعات تماس">
      <section className="rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-[0_10px_35px_rgba(26,35,50,0.05)] sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#194342] text-[#DBE7C1]">
            <UserRound className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-xs text-[#98A2B3]">حساب دانش‌آموزی</p>
            <h2 className="mt-1 text-lg font-bold text-[#1A2332]">{student.firstName} {student.lastName}</h2>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#1A2332]">اطلاعات هویتی</h2>
          <p className="mt-1 text-xs text-[#667085]">این اطلاعات توسط مدرسه مدیریت می‌شوند.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="نام" value={student.firstName} />
          <InfoItem label="نام خانوادگی" value={student.lastName} />
          <InfoItem label="کد ملی" value={maskNationalId(student.nationalId)} />
          <InfoItem label="تاریخ تولد" value={student.birthday ? new Intl.DateTimeFormat("fa-IR").format(student.birthday) : null} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#1A2332]">اطلاعات تحصیلی</h2>
          <p className="mt-1 text-xs text-[#667085]">پایه و کلاس توسط مدرسه تعیین می‌شود.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoItem label="سال تحصیلی" value={enrollment?.academicYear.title} />
          <InfoItem label="پایه" value={enrollment?.grade} />
          <InfoItem label="کلاس" value={enrollment?.className} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#1A2332]">اطلاعات قابل ویرایش</h2>
          <p className="mt-1 text-xs text-[#667085]">اطلاعات تماس خود را به‌روز نگه دارید.</p>
        </div>
        <StudentProfileEditForm initialValues={{
          mobile: student.mobile,
          fatherMobile: student.fatherMobile,
          motherMobile: student.motherMobile,
          address: student.address,
          landline: student.landline,
          email: student.email,
        }} />
      </section>

      <section className="rounded-2xl border border-[#E7E2DA] bg-[#F7F8F2] p-4">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#194342]" />
          <div>
            <p className="text-xs font-semibold text-[#344054]">اطلاعات هویتی محافظت شده‌اند</p>
            <p className="mt-1 text-xs leading-5 text-[#667085]">برای اصلاح کد ملی، نام، تاریخ تولد یا اطلاعات تحصیلی باید با مدرسه هماهنگ شود.</p>
          </div>
        </div>
      </section>
    </StudentPortalShell>
  );
}
