"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

type Settings = {
  schoolName: string;
  heroTitle: string;
  heroDescription: string;
  footerTitle: string;
  footerDescription: string;
  officialName: string | null;
  slogan: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  address: string | null;
  postalCode: string | null;
  workingHours: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  siteTitle: string | null;
  siteDescription: string | null;
  footerText: string | null;
  mapUrl: string | null;
  namAddressUrl: string | null;
  eitaaUrl: string | null;
  baleUrl: string | null;
  skyroomUrl: string | null;
  schoolStatusEnabled: boolean;
  schoolStatus: string | null;
  showNews: boolean;
  showEvents: boolean;
  showBirthdays: boolean;
  showTopStudents: boolean;
  showDailyAbsences: boolean;
};

const initial: Settings = {
  schoolName: "دبیرستان شاهد حضرت خدیجه (س)",
  heroTitle: "دبیرستان دخترانه شاهد حضرت خدیجه (س)",
  heroDescription: "محیطی امن، پویا و الهام‌بخش برای رشد علمی، اخلاقی و خلاقانه دانش‌آموزان؛ جایی برای یادگیری، تجربه و ساختن آینده‌ای روشن.",
  footerTitle: "شاهد حضرت خدیجه (س)",
  footerDescription: "دبیرستان دخترانه شاهد حضرت خدیجه (س) با هدف پرورش استعدادهای علمی و مهارتی دانش‌آموزان.",
  officialName: null,
  slogan: null,
  phone: null,
  mobile: null,
  email: null,
  address: null,
  postalCode: null,
  workingHours: null,
  logoUrl: null,
  faviconUrl: null,
  siteTitle: null,
  siteDescription: null,
  footerText: null,
  instagramUrl: null,
  telegramUrl: null,
  whatsappUrl: null,
  mapUrl: null,
  namAddressUrl: null,
  eitaaUrl: null,
  baleUrl: null,
  skyroomUrl: null,
  schoolStatusEnabled: false,
  schoolStatus: null,
  showNews: true,
  showEvents: true,
  showBirthdays: true,
  showTopStudents: true,
  showDailyAbsences: true,
};

export default function AdminSettings() {
  const [form, setForm] = useState<Settings>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "خطا در دریافت تنظیمات");
        setForm(data);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "خطا در دریافت تنظیمات"))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "خطا در ذخیره تنظیمات");
      setForm(data);
      toast.success("تنظیمات مدرسه ذخیره شد.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="p-8 text-center text-sm text-muted-foreground">در حال دریافت تنظیمات...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">تنظیمات مدرسه</h1>
          <p className="mt-1 text-sm text-muted-foreground">اطلاعات و تنظیمات عمومی سایت مدرسه</p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>

      <div className="space-y-5">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">اطلاعات مدرسه</h2>
          <p className="mt-1 text-xs text-muted-foreground">اطلاعات پایه‌ای که می‌تواند در بخش‌های مختلف سایت استفاده شود.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="نام مدرسه" value={form.schoolName} onChange={(v) => update("schoolName", v)} required />
            <Field label="نام رسمی" value={form.officialName ?? ""} onChange={(v) => update("officialName", v)} />
            <Field label="شعار مدرسه" value={form.slogan ?? ""} onChange={(v) => update("slogan", v)} />
            <Field label="ساعات کاری" value={form.workingHours ?? ""} onChange={(v) => update("workingHours", v)} />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">اطلاعات تماس</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="تلفن" value={form.phone ?? ""} onChange={(v) => update("phone", v)} />
            <Field label="شماره تلفن همراه" value={form.mobile ?? ""} onChange={(v) => update("mobile", v)} />
            <Field label="ایمیل" type="email" value={form.email ?? ""} onChange={(v) => update("email", v)} />
            <Field label="کد پستی" value={form.postalCode ?? ""} onChange={(v) => update("postalCode", v)} />
            <div className="md:col-span-2">
              <Label>آدرس</Label>
              <Textarea className="mt-1.5" value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>لینک نقشه</Label>
              <Input className="mt-1.5" value={form.mapUrl ?? ""} onChange={(e) => update("mapUrl", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">متن‌های سایت</h2>
          <p className="mt-1 text-xs text-muted-foreground">متن‌های اصلی Hero و بخش سمت راست Footer از اینجا کنترل می‌شوند.</p>
          <div className="mt-5 space-y-4">
            <Field label="عنوان Hero" value={form.heroTitle} onChange={(v) => update("heroTitle", v)} required />
            <div><Label>توضیح Hero</Label><Textarea className="mt-1.5" value={form.heroDescription} onChange={(e) => update("heroDescription", e.target.value)} /></div>
            <Field label="عنوان بخش سمت راست Footer" value={form.footerTitle} onChange={(v) => update("footerTitle", v)} required />
            <div><Label>متن بخش سمت راست Footer</Label><Textarea className="mt-1.5" value={form.footerDescription} onChange={(e) => update("footerDescription", e.target.value)} /></div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">شبکه‌های اجتماعی</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Instagram" value={form.instagramUrl ?? ""} onChange={(v) => update("instagramUrl", v)} />
            <Field label="Telegram" value={form.telegramUrl ?? ""} onChange={(v) => update("telegramUrl", v)} />
            <Field label="WhatsApp" value={form.whatsappUrl ?? ""} onChange={(v) => update("whatsappUrl", v)} />
            <Field label="ایتا" value={form.eitaaUrl ?? ""} onChange={(v) => update("eitaaUrl", v)} />
            <Field label="بله" value={form.baleUrl ?? ""} onChange={(v) => update("baleUrl", v)} />
            <Field label="اسکای‌روم" value={form.skyroomUrl ?? ""} onChange={(v) => update("skyroomUrl", v)} />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">وضعیت فعلی مدرسه</h2>
          <p className="mt-1 text-xs text-muted-foreground">اختیاری است؛ در صورت فعال‌سازی، وضعیت در اختیار بخش‌های عمومی سایت قرار می‌گیرد.</p>
          <div className="mt-4 flex items-center gap-3">
            <input type="checkbox" checked={form.schoolStatusEnabled} onChange={(e) => update("schoolStatusEnabled", e.target.checked)} className="h-4 w-4" />
            <Label>نمایش وضعیت فعلی مدرسه</Label>
          </div>
          {form.schoolStatusEnabled && (
            <div className="mt-4 max-w-xl">
              <Label>متن وضعیت</Label>
              <Input className="mt-1.5" placeholder="مثلاً: مدرسه امروز تعطیل است" value={form.schoolStatus ?? ""} onChange={(e) => update("schoolStatus", e.target.value)} />
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">نمایش بخش‌های سایت</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["showNews", "اخبار"],
              ["showEvents", "رویدادها"],
              ["showBirthdays", "تولدها"],
              ["showTopStudents", "دانش‌آموزان برتر"],
              ["showDailyAbsences", "غیبت‌های روزانه"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <input type="checkbox" checked={Boolean(form[key as keyof Settings])} onChange={(e) => update(key as keyof Settings, e.target.checked as never)} className="h-4 w-4" />
                {label}
              </label>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <Label>{label}{required ? " *" : ""}</Label>
      <Input type={type} className="mt-1.5" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
