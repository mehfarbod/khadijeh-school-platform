"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserRound,
  RotateCcw,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AcademicYear {
  id: string;
  title: string;
  isCurrent: boolean;
}

interface Enrollment {
  id: string;
  academicYearId: string;
  grade: string;
  className: string | null;
  academicYear: AcademicYear;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  mobile: string | null;
  birthday: string | null;
  isActive: boolean;
  enrollments: Enrollment[];
}

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
  دهم: "دهم",
  یازدهم: "یازدهم",
  دوازدهم: "دوازدهم",
};

export default function AdminInactiveStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reactivateId, setReactivateId] = useState<string | null>(null);
  const [reactivating, setReactivating] = useState(false);

  const loadInactiveStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/students?activeOnly=false");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "خطا در دریافت دانش‌آموزان غیرفعال",
        );
      }

      const inactiveStudents = Array.isArray(data)
        ? data.filter((student: Student) => !student.isActive)
        : [];

      setStudents(inactiveStudents);
    } catch (error) {
      console.error("Failed to load inactive students:", error);

      setStudents([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در دریافت دانش‌آموزان غیرفعال",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInactiveStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return students;
    }

    return students.filter((student) => {
      const fullName =
        `${student.firstName} ${student.lastName}`.toLowerCase();

      return (
        fullName.includes(normalizedSearch) ||
        student.nationalId?.includes(normalizedSearch) ||
        student.mobile?.includes(normalizedSearch)
      );
    });
  }, [students, search]);

  const getCurrentEnrollment = (student: Student) => {
    if (!student.enrollments.length) {
      return null;
    }

    return student.enrollments[0];
  };

  const handleReactivate = async () => {
    if (!reactivateId) {
      return;
    }

    try {
      setReactivating(true);

      const response = await fetch(
        `/api/students/${reactivateId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: true,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "خطا در فعال‌سازی مجدد دانش‌آموز",
        );
      }

      toast.success("دانش‌آموز با موفقیت فعال شد.");

      setReactivateId(null);

      await loadInactiveStudents();
    } catch (error) {
      console.error("Failed to reactivate student:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در فعال‌سازی مجدد دانش‌آموز",
      );
    } finally {
      setReactivating(false);
    }
  };

  return (
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <UserRound className="h-5 w-5 text-muted-foreground" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-foreground">
              دانش‌آموزان غیرفعال
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              مدیریت و فعال‌سازی مجدد دانش‌آموزان غیرفعال
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-border/60 bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              تعداد دانش‌آموزان غیرفعال
            </p>

            <p className="mt-1 text-2xl font-bold">
              {students.length}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="جستجوی نام، کد ملی یا موبایل..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  نام و نام خانوادگی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  کد ملی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  پایه
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  کلاس
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  سال تحصیلی
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  وضعیت
                </th>

                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/30"
                  >
                    {Array.from({ length: 7 }).map(
                      (_, columnIndex) => (
                        <td
                          key={columnIndex}
                          className="px-4 py-4"
                        >
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </td>
                      ),
                    )}
                  </tr>
                ))
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <UserRound className="mb-3 h-8 w-8 text-muted-foreground" />

                      <p className="font-medium">
                        {search
                          ? "دانش‌آموزی پیدا نشد."
                          : "دانش‌آموز غیرفعالی وجود ندارد."}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {search
                          ? "عبارت جستجو را تغییر دهید."
                          : "همه دانش‌آموزان در حال حاضر فعال هستند."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const enrollment =
                    getCurrentEnrollment(student);

                  return (
                    <tr
                      key={student.id}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="px-4 py-4">
                        <div className="font-medium">
                          {student.firstName}{" "}
                          {student.lastName}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {student.nationalId || "—"}
                      </td>

                      <td className="px-4 py-4">
                        {enrollment
                          ? gradeLabels[enrollment.grade] ??
                            enrollment.grade
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        {enrollment?.className
                          ? `کلاس ${enrollment.className}`
                          : "—"}
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {enrollment?.academicYear?.title || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                          غیرفعال
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() =>
                            setReactivateId(student.id)
                          }
                        >
                          <RotateCcw className="h-4 w-4" />
                          فعال‌سازی
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredStudents.length > 0 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <GraduationCap className="h-4 w-4" />

          <span>
            {filteredStudents.length} دانش‌آموز غیرفعال نمایش داده می‌شود.
          </span>
        </div>
      )}

      <AlertDialog
        open={Boolean(reactivateId)}
        onOpenChange={(open) => {
          if (!open && !reactivating) {
            setReactivateId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              فعال‌سازی مجدد دانش‌آموز
            </AlertDialogTitle>

            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید این دانش‌آموز را
              دوباره فعال کنید؟
              <br />
              پس از فعال‌سازی، دانش‌آموز دوباره در فهرست
              دانش‌آموزان فعال و آمار کلاس‌ها نمایش داده خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={reactivating}>
              انصراف
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleReactivate();
              }}
              disabled={reactivating}
            >
              {reactivating
                ? "در حال فعال‌سازی..."
                : "فعال‌سازی مجدد"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
  );
}