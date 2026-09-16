import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Users, GraduationCap, BookOpen, Calendar, Bell, Newspaper, Cake, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminOverview() {
  const studentCount = useQuery(api.students.countActive, {});
  const staffCount = useQuery(api.staff.count, {});
  const courseCount = useQuery(api.courses.count, {});
  const eventCount = useQuery(api.events.count, {});
  const announcementCount = useQuery(api.announcements.count, {});
  const messages = useQuery(api.contactMessages.unreadCount, {});
  const birthdays = useQuery(api.birthdays.today, {});

  const stats = [
    { label: "دانش‌آموز فعال", value: studentCount, icon: Users, color: "bg-primary/5 text-primary" },
    { label: "کادر مدرسه", value: staffCount, icon: GraduationCap, color: "bg-rose/10 text-rose" },
    { label: "دوره فعال", value: courseCount, icon: BookOpen, color: "bg-gold/10 text-gold" },
    { label: "رویداد", value: eventCount, icon: Calendar, color: "bg-green-50 text-green-600" },
    { label: "اعلامیه", value: announcementCount, icon: Bell, color: "bg-navy/10 text-navy" },
    { label: "پیام جدید", value: messages, icon: Newspaper, color: "bg-primary/5 text-primary" },
    { label: "تولد امروز", value: birthdays?.length, icon: Cake, color: "bg-rose/10 text-rose" },
  ];

  const seedDatabase = useMutation(api.seed.seedAll);
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedDatabase();
      if (result === "already_seeded") {
        toast.info("داده‌ها قبلاً وارد شده‌اند");
      } else {
        toast.success("داده‌های نمونه با موفقیت وارد شدند!");
      }
    } catch (e: any) {
      toast.error(e.message || "خطا در وارد کردن داده‌ها");
    }
    setSeeding(false);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">داشبورد</h1>
          <p className="text-sm text-muted-foreground mt-1">خلاصه وضعیت مدرسه</p>
        </div>
        <Button onClick={handleSeed} disabled={seeding} variant="outline" size="sm" className="gap-2">
          <Database className="h-4 w-4" />
          {seeding ? "در حال وارد کردن..." : "وارد کردن داده‌های نمونه"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/60 bg-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stat.value === undefined ? (
                <span className="inline-block h-7 w-12 bg-muted rounded animate-pulse" />
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
