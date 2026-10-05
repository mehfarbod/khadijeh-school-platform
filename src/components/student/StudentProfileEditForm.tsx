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

type FieldName = keyof ProfileValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const fields: Array<{
  key: Exclude<FieldName, "address">;
  label: string;
  placeholder: string;
  type: "email" | "tel";
  autoComplete: string;
}> = [
  { key: "mobile", label: "شماره موبایل دانش‌آموز", placeholder: "0912...", type: "tel", autoComplete: "tel" },
  { key: "fatherMobile", label: "موبایل پدر", placeholder: "0912...", type: "tel", autoComplete: "tel" },
  { key: "motherMobile", label: "موبایل مادر", placeholder: "0912...", type: "tel", autoComplete: "tel" },
  { key: "landline", label: "تلفن ثابت", placeholder: "021...", type: "tel", autoComplete: "tel" },
  { key: "email", label: "ایمیل", placeholder: "example@email.com", type: "email", autoComplete: "email" },
];

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
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

      const data = (await response.json()) as {
        error?: string;
        details?: Partial<Record<FieldName, string[] | undefined>>;
      };

      if (!response.ok) {
        if (data.details) {
          setFieldErrors(
            Object.fromEntries(
              Object.entries(data.details)
                .filter((entry): entry is [FieldName, string[]] => Array.isArray(entry[1]) && entry[1].length > 0)
                .map(([key, messages]) => [key, messages[0]]),
            ),
          );
        }
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

  const update = (key: FieldName, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSuccess(false);
  };

  return (
    <form onSubmit={save} className="rounded-2xl border border-[#E7E2DA] bg-white p-5 shadow-[0_10px_35px_rgba(26,35,50,0.05)] sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => {
          const fieldError = fieldErrors[field.key];

          return (
          <label key={field.key} className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#344054]">{field.label}</span>
            <Input
              id={`profile-${field.key}`}
              type={field.type}
              value={form[field.key]}
              onChange={(event) => update(field.key, event.target.value)}
              placeholder={field.placeholder}
              dir={field.key === "email" ? "ltr" : "rtl"}
              inputMode={field.type === "email" ? "email" : "tel"}
              autoComplete={field.autoComplete}
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={fieldError ? `profile-${field.key}-error` : undefined}
              disabled={saving}
              className="h-11 border-[#D5DECB] bg-[#FCFDF9] focus-visible:ring-[#194342]"
            />
            {fieldError ? <span id={`profile-${field.key}-error`} className="mt-1.5 block text-xs text-[#B42318]">{fieldError}</span> : null}
          </label>
          );
        })}

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-[#344054]">آدرس</span>
          <textarea
            id="profile-address"
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            rows={4}
            disabled={saving}
            placeholder="آدرس محل سکونت"
            autoComplete="street-address"
            aria-invalid={fieldErrors.address ? true : undefined}
            aria-describedby={fieldErrors.address ? "profile-address-error" : undefined}
            className="w-full resize-none rounded-lg border border-[#D5DECB] bg-[#FCFDF9] px-3 py-2.5 text-sm outline-none transition focus:border-[#194342] focus:ring-2 focus:ring-[#194342]/10"
          />
          {fieldErrors.address ? <span id="profile-address-error" className="mt-1.5 block text-xs text-[#B42318]">{fieldErrors.address}</span> : null}
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEAE3] pt-5">
        <div className="text-xs">
          {error ? <p role="alert" className="text-[#B42318]">{error}</p> : null}
          {success ? <p role="status" className="text-[#27745A]">اطلاعات با موفقیت ذخیره شد.</p> : null}
          {!error && !success ? (
            <p className="text-[#98A2B3]">اطلاعات هویتی و تحصیلی توسط مدرسه مدیریت می‌شود.</p>
          ) : null}
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="h-11 gap-2 bg-[#B86F5B] px-5 text-white hover:bg-[#A45F4D]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}
