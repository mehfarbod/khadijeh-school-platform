import Link from "next/link";

import Header from "@/components/layout/Header";
import CoursesFooter from "@/components/courses/CoursesFooter";
import RegistrationForm from "@/components/registration/RegistrationForm";

export default function RegistrationPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#FAF8F3]">
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex text-sm text-[#194342]/70 transition hover:text-[#194342]"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>

        <RegistrationForm />
      </main>

      <CoursesFooter />
    </>
  );
}
