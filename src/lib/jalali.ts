import { toGregorian, toJalaali } from "jalaali-js";

function normalizeDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function isValidJalaliDate(value: string) {
  const normalized = normalizeDigits(value).replaceAll("-", "/");
  const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return false;

  const jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);

  try {
    const { gy, gm, gd } = toGregorian(jy, jm, jd);
    const back = toJalaali(gy, gm, gd);
    return back.jy === jy && back.jm === jm && back.jd === jd;
  } catch {
    return false;
  }
}

export function jalaliToGregorianDate(value: string) {
  if (!isValidJalaliDate(value)) return null;

  const [jy, jm, jd] = normalizeDigits(value).replaceAll("-", "/").split("/").map(Number);
  const { gy, gm, gd } = toGregorian(jy, jm, jd);

  return `${gy}-${pad(gm)}-${pad(gd)}`;
}

export function gregorianToJalaliDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const { jy, jm, jd } = toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );

  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

export function formatGregorianDateAsJalali(value: string) {
  const date = gregorianToJalaliDate(value);
  return date ? toPersianDigits(date) : value;
}

export function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}
