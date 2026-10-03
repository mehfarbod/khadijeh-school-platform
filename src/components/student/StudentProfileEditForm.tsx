"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileValues = {
  mobile: string | null;
  fatherMobile: string | null;
  motherMobile: string | null;
  address: string | null;
  landline: string | null;
  email: string | null;
};

export default function StudentProfileEditForm({
  initialValues,
}: {
  initialValues: ProfileValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    mobile: initialValues.mobile ?? "",
    fatherMobile: initialValues.fatherMobile ?? "",
    motherMobile: initialValues.motherMobile ?? "",
    address: initialValues.address ?? "",
    landline: initialValues.landline ?? "",
    email: initialValues.email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/student-portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: form.mobile || null,
          fatherMobile: form.fatherMobile || null,
          motherMobile: form.motherMobile || null,
          address: form.address || null,
          landline: form.landline || null,
          email: form.email || null,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "ذخیره اطلاعات انجام نشد.");
      }

      setSuccess(true);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "ذخیره اطلاعات انجام نشد.",
      );
    } finally {
      setSaving(false);
    }
  }

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess(false);
  };

  return (
    <form onSubmit={save} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-[0_10px_35px_rgba(26,35,50,0.05)] sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          ["mobile", "شماره موبایل دانش‌آموز", "0912..."],
          ["fatherMobile", "موبایل پدر", "0912..."],
          ["motherMobile", "موبایل مادر", "0912..."],
          ["landline", "تلفن ثابت", "021..."],
          ["email", "ایمیل", "example@email.com"],
        ].map(([key, label, placeholder]) => (
          <label key={key} className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#344054]">{label}</span>
            <Input
              value={form[key as keyof typeof form]}
              onChange={(event) => update(key as keyof typeof form, event.target.value)}
              placeholder={placeholder}
              dir={key === "email" ? "ltr" : "rtl"}
              inputMode={key === "email" ? "email" : "tel"}
              disabled={saving}
              className="h-11 border-[#D5DECB] bg-[#FCFDF9] focus-visible:ring-[#194342]"
            />
          </label>
        ))}

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-[#344054]">آدرس</span>
          <textarea
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            rows={4}
            disabled={saving}
            placeholder="آدرس محل سکونت"
            className="w-full resize-none rounded-lg border border-[#D5DECB] bg-[#FCFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#194342] focus:ring-2 focus:ring-[#194342]/10"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEAE3] pt-5">
        <div className="text-xs">
          {error ? <p className="text-[#B42318]">{error}</p> : null}
          {success ? <p className="text-[#27745A]">اطلاعات با موفقیت ذخیره شد.</p> : null}
          {!error && !success ? (
            <p className="text-[#98A2B3]">اطلاعات هویتی و تحصیلی توسط مدرسه مدیریت می‌شود.</p>
          ) : null}
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="h-10 gap-2 bg-[#B86F5B] px-5 text-white hover:bg-[#A45F4D]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}
