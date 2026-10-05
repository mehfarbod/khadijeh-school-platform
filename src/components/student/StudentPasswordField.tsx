"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";

export default function StudentPasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
  errorId,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  disabled: boolean;
  errorId?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[#344054]">
        {label}
      </label>
      <div className="relative" dir="ltr">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          className="h-11 border-[#D5DECB] bg-[#FCFDF9] pl-11"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? "پنهان‌کردن رمز عبور" : "نمایش رمز عبور"}
          aria-pressed={visible}
          className="absolute inset-y-0 left-0 flex w-11 items-center justify-center rounded-l-lg text-[#667085] transition-colors hover:text-[#194342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#194342] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
