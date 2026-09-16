import PublicLayout from "@/components/layout/PublicLayout";
import TeachersClient from "@/components/sections/TeachersClient";

export const metadata = {
  title: "کادر مدرسه | دبیرستان شاهد حضرت خدیجه (ص)",
};

export default function TeachersPage() {
  return (
    <PublicLayout>
      <TeachersClient />
    </PublicLayout>
  );
}
