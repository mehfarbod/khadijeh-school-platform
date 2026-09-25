"use client";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface JalaliDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function JalaliDatePicker({
  value,
  onChange,
  placeholder = "تاریخ تولد",
  className = "",
  disabled = false,
}: JalaliDatePickerProps) {
  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      calendarPosition="bottom-right"
      value={value || ""}
      onChange={(date) => {
        if (!date) {
          onChange("");
          return;
        }

        onChange(date.format("YYYY/MM/DD"));
      }}
      format="YYYY/MM/DD"
      placeholder={placeholder}
      disabled={disabled}
      inputClass={className}
    />
  );
}
