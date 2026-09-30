import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, UserRound } from "lucide-react";
import { getCurrentStudent } from "@/lib/auth/student-session";

export const metadata = {
  title: "پروفایل دانش‌آموز | دبیرستان شاهد حضرت خدیجه (ص)",
};

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "ثبت نشده"}</p>
    </div>
  );
}

export default async function StudentProfilePage() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/portal/login");
  }

  const enrollment = student.enrollments[0];

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به پرتال
          </Link>
        </div>

        <section className="rounded-2xl border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <UserRound className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">پروفایل دانش‌آموز</p>
              <h1 className="mt-1 text-2xl font-bold">
                {student.firstName} {student.lastName}
              </h1>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">اطلاعات شخصی</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="نام" value={student.firstName} />
            <InfoItem label="نام خانوادگی" value={student.lastName} />
            <InfoItem label="کد ملی" value={student.nationalId} />
            <InfoItem label="شماره موبایل" value={student.mobile} />
            <InfoItem
              label="شماره شناسنامه"
              value={student.birthCertificateSerial}
            />
            <InfoItem
              label="تاریخ تولد"
              value={
                student.birthday
                  ? new Intl.DateTimeFormat("fa-IR").format(student.birthday)
                  : null
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">اطلاعات تحصیلی</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="سال تحصیلی" value={enrollment?.academicYear.title} />
            <InfoItem label="پایه" value={enrollment?.grade} />
            <InfoItem label="کلاس" value={enrollment?.className} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">اطلاعات تماس</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem label="موبایل پدر" value={student.fatherMobile} />
            <InfoItem label="موبایل مادر" value={student.motherMobile} />
            <div className="sm:col-span-2">
              <InfoItem label="آدرس" value={student.address} />
            </div>
            <InfoItem label="تلفن ثابت" value={student.landline} />
          </div>
        </section>
      </div>
    </main>
  );
}
