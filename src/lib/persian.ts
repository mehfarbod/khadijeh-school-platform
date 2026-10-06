// Persian number converter
const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianNumber(num: number | string): string {
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

// Simple Persian date formatting
const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export function gregorianToPersianDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  try {
    return new Intl.DateTimeFormat("fa-IR", options).format(date);
  } catch {
    return dateStr;
  }
}

export function formatPersianDate(dateStr: string): string {
  return gregorianToPersianDate(dateStr);
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${toPersianNumber(day)} ${persianMonths[month - 1]}`;
}

export function formatJalaliDateShort(dateStr: string): string {
  const normalized = dateStr.replaceAll("-", "/");
  const [year, month, day] = normalized.split("/").map(Number);

  if (!year || !month || !day || !persianMonths[month - 1]) {
    return dateStr;
  }

  return `${toPersianNumber(day)} ${persianMonths[month - 1]}`;
}

// School grade labels
export const GRADE_LABELS: Record<string, string> = {
  "10": "پایه دهم",
  "11": "پایه یازدهم",
  "12": "پایه دوازدهم",
  "دهم": "پایه دهم",
  "یازدهم": "پایه یازدهم",
  "دوازدهم": "پایه دوازدهم",
};

export function getPersianGradeName(grade: string | null | undefined) {
  if (!grade) return null;

  return GRADE_LABELS[grade]?.replace(/^پایه\s+/, "") ?? grade;
}

export function formatPersianGrade(grade: string | null | undefined) {
  if (!grade) return null;

  return GRADE_LABELS[grade] ?? `پایه ${grade}`;
}
