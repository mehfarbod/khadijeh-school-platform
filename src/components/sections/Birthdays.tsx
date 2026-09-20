"use client";

import { useEffect, useState } from "react";
import { Cake, Gift } from "lucide-react";

interface Birthday {
  id: string;
  firstName: string;
  grade: string;
  birthday: string;
  photo: string | null;
  isVisible: boolean;
}

export default function Birthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[] | null>(null);

  useEffect(() => {
    const loadBirthdays = async () => {
      try {
        const response = await fetch("/api/birthdays");

        if (!response.ok) {
          throw new Error("خطا در دریافت تولدها");
        }

        const data = await response.json();
        setBirthdays(data);
      } catch (error) {
        console.error("Failed to load birthdays:", error);
        setBirthdays([]);
      }
    };

    loadBirthdays();
  }, []);

  if (!birthdays) return null;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const getBirthdayParts = (birthday: string) => {
    const [month, day] = birthday.split("-").map(Number);

    return {
      month,
      day,
    };
  };

  const todayBirthdays = birthdays.filter((birthday) => {
    const { month, day } = getBirthdayParts(birthday.birthday);

    return month === currentMonth && day === currentDay;
  });

  const upcomingBirthdays = birthdays
    .map((birthday) => {
      const { month, day } = getBirthdayParts(birthday.birthday);

      let daysUntil = 0;

      if (month === currentMonth) {
        daysUntil = day - currentDay;
      } else if (month > currentMonth) {
        const currentYearDate = new Date(
          now.getFullYear(),
          currentMonth - 1,
          currentDay
        );

        const birthdayDate = new Date(
          now.getFullYear(),
          month - 1,
          day
        );

        daysUntil = Math.ceil(
          (birthdayDate.getTime() - currentYearDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
      } else {
        const currentYearDate = new Date(
          now.getFullYear(),
          currentMonth - 1,
          currentDay
        );

        const birthdayDate = new Date(
          now.getFullYear() + 1,
          month - 1,
          day
        );

        daysUntil = Math.ceil(
          (birthdayDate.getTime() - currentYearDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
      }

      return {
        ...birthday,
        daysUntil,
      };
    })
    .filter((birthday) => birthday.daysUntil > 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  const hasData =
    todayBirthdays.length > 0 || upcomingBirthdays.length > 0;

  if (!hasData) return null;

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose/10">
            <Cake className="h-5 w-5 text-rose" />
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              امروز تولد چه کسی است؟
            </h2>

            <p className="text-xs text-muted-foreground mt-0.5">
              تولدهای امروز و پیش‌رو
            </p>
          </div>
        </div>

        {/* Today's birthdays */}
        {todayBirthdays.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-rose mb-3">
              تولدهای امروز
            </p>

            <div className="flex flex-wrap gap-3">
              {todayBirthdays.map((birthday) => (
                <div
                  key={birthday.id}
                  className="flex items-center gap-3 rounded-xl border border-rose/20 bg-rose/5 px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose/10">
                    <Gift className="h-4 w-4 text-rose" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {birthday.firstName}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {birthday.grade}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming birthdays */}
        {upcomingBirthdays.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              تولدهای پیش‌رو
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {upcomingBirthdays.map((birthday) => (
                <div
                  key={birthday.id}
                  className="rounded-lg border border-border/60 bg-card p-3 text-center"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted mx-auto mb-2">
                    <Cake className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  <p className="text-xs font-medium text-foreground">
                    {birthday.firstName}
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    {birthday.grade}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}