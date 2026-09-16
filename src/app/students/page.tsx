import PublicLayout from "@/components/layout/PublicLayout";
import StudentsClient from "@/components/sections/StudentsClient";

export const metadata = {
  title: "دانش‌آموزان | دبیرستان شاهد حضرت خدیجه (ص)",
};

export default function StudentsPage() {
  return (
    <PublicLayout>
      <StudentsClient />
    </PublicLayout>
  );
}
