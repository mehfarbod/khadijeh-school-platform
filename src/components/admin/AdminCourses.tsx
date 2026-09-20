"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

interface Course {
  id: string;
  title: string;
  status: string;
  capacity: number;
  currentRegistrations: number;
  isActive: boolean;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[] | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch("/api/courses?activeOnly=false");

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data: Course[] = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setCourses([]);
      }
    };

    loadCourses();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">
          دوره‌ها
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          مدیریت دوره‌های آموزشی
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  عنوان
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  وضعیت
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  ظرفیت
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  ثبت‌نام
                </th>
              </tr>
            </thead>

            <tbody>
              {!courses ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/30"
                  >
                    {Array.from({ length: 4 }).map(
                      (_, columnIndex) => (
                        <td
                          key={columnIndex}
                          className="px-4 py-3"
                        >
                          <div className="h-4 animate-pulse rounded bg-muted" />
                        </td>
                      )
                    )}
                  </tr>
                ))
              ) : courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                    هنوز دوره‌ای ثبت نشده.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-border/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      {course.title}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs text-primary">
                        {course.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {course.capacity}
                    </td>

                    <td className="px-4 py-3">
                      {course.currentRegistrations}/
                      {course.capacity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}