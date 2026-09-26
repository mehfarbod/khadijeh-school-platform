"use client";

import { Cake, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type BirthdayStudent = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  birthday: string | null;
};

function todayLabel() {
  return new Intl.DateTimeFormat("fa-IR", {
    calendar: "persian",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export default function SchoolCelebrations() {
  const [birthdays, setBirthdays] = useState<BirthdayStudent[]>([]);

  useEffect(() => {
    fetch("/api/birthdays", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : []))
      .then(setBirthdays)
      .catch(() => setBirthdays([]));
  }, []);

  if (birthdays.length === 0) return null;

  return (
    <section className="border-t border-[#E8E3D8] bg-[#FAF8F3] px-6 py-12 md:py-14">
      <div className="mx-auto max-w-screen-xl">
        <div className="mb-7 text-center">
          <div className="flex items-center justify-center gap-3">
            <Cake className="h-6 w-6 text-[#194342]" strokeWidth={1.7} />
            <span className="text-[13px] font-semibold text-[#667085]">{todayLabel()}</span>
            <span className="h-4 w-px bg-[#D5DAD2]" />
            <h2 className="text-[22px] font-bold text-[#194342]">جشن‌های کوچک مدرسه</h2>
          </div>
          <p className="mt-2 text-[13px] text-[#667085]">امروز یک بهانه برای شادی داریم</p>
        </div>

        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-4">
          {birthdays.map((student) => (
            <article key={`${student.id}-birthday`} className="flex w-full max-w-[360px] items-center gap-4 rounded-[18px] border border-[#DBE7C1] bg-white p-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#194342] to-[#3F5D3E] text-xl font-bold leading-none text-white">
                {student.firstName.trim().charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-[#1F2933]">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="mt-1 text-xs text-[#667085]">{student.grade}</p>
              </div>
              <div className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-[#DBE7C1] px-3 py-2 sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-[#194342]" strokeWidth={1.7} />
                <span className="text-[10px] font-semibold text-[#194342]">روز شادی</span>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[#667085]">
          تولدتان مبارک؛ امیدواریم سالی پر از موفقیت و شادی داشته باشید 🌱
        </p>
      </div>
    </section>
  );
}
