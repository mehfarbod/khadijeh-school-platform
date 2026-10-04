"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import { getStudentLoginUrl } from "@/lib/auth/student-return-to";

type FormErrors = {
  form?: string;
};

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

function CourseRegistrationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseSlug = searchParams?.get("course");

  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    slug: string;
    title: string;
    gradeLevel: string | null;
    schedule: string | null;
    duration: string | null;
  } | null>(null);
  const [isCourseLoading, setIsCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState("");
  const [student, setStudent] = useState<{
    firstName: string;
    lastName: string;
    grade: string;
  } | null>(null);
  const [isStudentLoading, setIsStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      if (!courseSlug) {
        router.replace("/courses");
        return;
      }

      try {
        setIsCourseLoading(true);
        setCourseError("");
        const response = await fetch(
          `/api/courses?slug=${encodeURIComponent(courseSlug)}`,
          { cache: "no-store" },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data?.error || "دوره موردنظر پیدا نشد.");
        if (!cancelled) setSelectedCourse(data);
      } catch (error) {
        if (!cancelled) {
          setCourseError(error instanceof Error ? error.message : "دوره موردنظر پیدا نشد.");
        }
      } finally {
        if (!cancelled) setIsCourseLoading(false);
      }
    }

    loadCourse();
    return () => { cancelled = true; };
  }, [courseSlug, router]);

  useEffect(() => {
    let cancelled = false;
    let redirecting = false;

    async function loadStudent() {
      if (!courseSlug) return;

      try {
        setIsStudentLoading(true);
        setStudentError("");
        const response = await fetch(
          "/api/student-portal/course-registration-context",
          { cache: "no-store" },
        );
        const data = await response.json();

        if (response.status === 401) {
          const returnTo = `/courses/registration?course=${encodeURIComponent(courseSlug)}`;
          redirecting = true;
          router.replace(getStudentLoginUrl(returnTo));
          return;
        }

        if (!response.ok) {
          throw new Error(data?.error || "اطلاعات دانش‌آموز دریافت نشد.");
        }

        if (!cancelled) setStudent(data);
      } catch (error) {
        if (!cancelled) {
          setStudentError(
            error instanceof Error
              ? error.message
              : "اطلاعات دانش‌آموز دریافت نشد.",
          );
        }
      } finally {
        if (!cancelled && !redirecting) setIsStudentLoading(false);
      }
    }

    loadStudent();
    return () => { cancelled = true; };
  }, [courseSlug, router]);

  if (!courseSlug) return null;

  if (isCourseLoading || isStudentLoading) {
    return (
      <>
        <Header />
        <main className="flex min-h-[500px] items-center justify-center bg-[#FAF8F3]">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#DBE7C1]" />
        </main>
        <CoursesFooter />
      </>
    );
  }

  if (courseError || !selectedCourse) {
    return (
      <>
        <Header />
        <main className="min-h-[500px] bg-[#FAF8F3] px-5 py-20 text-center">
          <p className="text-sm text-red-600">{courseError || "دوره موردنظر پیدا نشد."}</p>
          <Link href="/courses" className="mt-6 inline-flex rounded-[10px] bg-[#194342] px-5 py-2.5 text-sm text-white">
            بازگشت به دوره‌ها
          </Link>
        </main>
        <CoursesFooter />
      </>
    );
  }

  if (studentError || !student) {
    return (
      <>
        <Header />
        <main className="min-h-[500px] bg-[#FAF8F3] px-5 py-20 text-center" dir="rtl">
          <p className="text-sm text-red-600">
            {studentError || "اطلاعات دانش‌آموز دریافت نشد."}
          </p>
          <Link href="/portal/profile" className="mt-6 inline-flex rounded-[10px] bg-[#194342] px-5 py-2.5 text-sm text-white">
            مشاهده پروفایل دانش‌آموزی
          </Link>
        </main>
        <CoursesFooter />
      </>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitted(false);
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/course-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug,
          notes: description.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "ثبت درخواست ثبت‌نام انجام نشد.");

      setIsSubmitted(true);
      setDescription("");
      setErrors({});
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "ثبت درخواست ثبت‌نام انجام نشد.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF8F3]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#194342]">
          <div className="absolute -right-[70px] -top-[70px] h-[240px] w-[240px] rounded-full border border-[#DBE7C1]/15" />

          <div className="absolute -right-[35px] -top-[35px] h-[155px] w-[155px] rounded-full border border-[#DBE7C1]/10" />

          <div className="absolute -bottom-[100px] -left-[100px] h-[280px] w-[280px] rounded-full border border-[#DBE7C1]/10" />

          <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 py-12 text-center sm:px-6">
            <span className="inline-flex rounded-full border border-[#DBE7C1]/30 bg-[#DBE7C1]/[0.18] px-3.5 py-1 text-xs font-medium text-[#DBE7C1]">
              شاهد حضرت خدیجه (س)
            </span>

            <h1 className="mt-4 text-[clamp(26px,5vw,38px)] font-bold leading-[1.4] text-white">
              ثبت‌نام در دوره
            </h1>

            <p className="mx-auto mt-3 max-w-[560px] text-[13.5px] leading-[1.9] text-[#DBE7C1]/85 sm:text-[15px]">
              اطلاعات خود را وارد کنید تا درخواست ثبت‌نام شما در دوره موردنظر
              ثبت شود.
            </p>
          </div>
        </section>

        {/* Registration Form */}
        <section className="mx-auto w-full max-w-[760px] px-5 py-10 sm:px-6 sm:py-14">
          <Link
            href="/courses"
            className="mb-5 inline-flex items-center text-[12.5px] font-medium text-[#194342] transition-colors hover:text-[#B86F5B]"
          >
            ← بازگشت به دوره‌ها
          </Link>

          <div className="rounded-[20px] border border-[#DBE7C1] bg-white p-5 sm:p-8">
            {!isSubmitted ? (
              <>
                <div>
                  <h2 className="text-[18px] font-bold text-[#194342]">
                    اطلاعات ثبت‌نام
                  </h2>

                  <p className="mt-2 text-[12.5px] leading-6 text-[#667085]">
                    اطلاعات هویتی شما از حساب دانش‌آموزی تأیید شده است.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-8 space-y-5"
                >
                  {/* Selected Course */}
                  <div>
                    <label className="mb-2 block text-[12.5px] font-medium text-[#1F2933]">
                      دوره موردنظر
                    </label>

                    <div className="rounded-[10px] border border-[#DBE7C1] bg-[#F1F5E8] px-4 py-3">
                      <p className="text-[13px] font-medium text-[#194342]">
                        {selectedCourse.title}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-[#667085]">
                        <span>{selectedCourse.gradeLevel || "همه پایه‌ها"}</span>

                        {selectedCourse.schedule && <span>{selectedCourse.schedule}</span>}

                        {selectedCourse.duration && <span>{selectedCourse.duration}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-[12px] border border-[#DBE7C1] bg-[#FCFDF9] p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] text-[#98A2B3]">دانش‌آموز</p>
                      <p className="mt-1 text-[13px] font-medium text-[#194342]">
                        {student.firstName} {student.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#98A2B3]">پایه تحصیلی</p>
                      <p className="mt-1 text-[13px] font-medium text-[#194342]">
                        پایه {gradeLabels[student.grade] ?? student.grade}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-[12.5px] font-medium text-[#1F2933]"
                    >
                      توضیحات
                      <span className="mr-1 font-normal text-[#98A2B3]">
                        (اختیاری)
                      </span>
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="اگر توضیح یا درخواست خاصی دارید، اینجا بنویسید."
                      className="w-full resize-none rounded-[10px] border border-[#DBE7C1] bg-white px-4 py-3 text-[13px] leading-7 text-[#1F2933] outline-none transition-colors placeholder:text-[#98A2B3] focus:border-[#194342]"
                    />
                  </div>

                  {errors.form && (
                    <p className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[11.5px] leading-6 text-red-600">
                      {errors.form}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#B86F5B] text-[13px] font-medium text-white transition-colors hover:bg-[#A45F4D] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "در حال ثبت درخواست..."
                      : "ثبت درخواست ثبت‌نام"}
                  </button>
                </form>
              </>
            ) : (
              /* Success */
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DBE7C1]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 text-[#194342]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>

                <h2 className="mt-5 text-[20px] font-bold text-[#194342]">
                  درخواست شما ثبت شد
                </h2>

                <p className="mx-auto mt-3 max-w-[440px] text-[13px] leading-7 text-[#667085]">
                  درخواست ثبت‌نام شما برای دوره{" "}
                  <span className="font-medium text-[#194342]">
                    {selectedCourse.title}
                  </span>{" "}
                  با موفقیت ثبت شد.
                </p>

                <p className="mt-2 text-[12px] leading-6 text-[#98A2B3]">
                  پس از بررسی اطلاعات، مدرسه با شما تماس خواهد گرفت.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/portal/courses"
                    className="flex h-10 items-center justify-center rounded-[10px] bg-[#194342] px-6 text-[12.5px] font-medium text-white transition-colors hover:bg-[#143837]"
                  >
                    مشاهده دوره‌های من
                  </Link>
                  <Link
                    href="/courses"
                    className="flex h-10 items-center justify-center rounded-[10px] border border-[#DBE7C1] px-6 text-[12.5px] font-medium text-[#194342] transition-colors hover:bg-[#F1F5E8]"
                  >
                    بازگشت به دوره‌ها
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <CoursesFooter />
    </>
  );
}

function CourseRegistrationFallback() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF8F3]">
        <section className="flex min-h-[500px] items-center justify-center px-5">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#DBE7C1]" />
        </section>
      </main>

      <CoursesFooter />
    </>
  );
}

export default function CourseRegistrationPage() {
  return (
    <Suspense fallback={<CourseRegistrationFallback />}>
      <CourseRegistrationContent />
    </Suspense>
  );
}
