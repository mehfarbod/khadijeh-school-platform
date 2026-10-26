"use client";

import AdminGrades from "@/components/admin/AdminGrades";
import TeacherGrades from "@/components/admin/TeacherGrades";
import { useAuth } from "@/hooks/use-auth";

export default function AdminGradesPageClient() {
  const { user } = useAuth();

  if (user?.role === "TEACHER") {
    return <TeacherGrades />;
  }

  return <AdminGrades />;
}
