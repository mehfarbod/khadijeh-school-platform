import { toGregorian, toJalaali } from "jalaali-js";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)),
    );
}

export function isValidJalaliDate(value: string) {
  const normalized = normalizeDigits(value).trim();

  const match = normalized.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (year < 1300 || year > 1500) {
    return false;
  }

  if (month < 1 || month > 12) {
    return false;
  }

  const maxDay =
    month <= 6
      ? 31
      : month <= 11
        ? 30
        : 30;

  if (day < 1 || day > maxDay) {
    return false;
  }

  try {
    const gregorian = toGregorian(year, month, day);

    const check = new Date(
      Date.UTC(
        gregorian.gy,
        gregorian.gm - 1,
        gregorian.gd,
      ),
    );

    return (
      check.getUTCFullYear() === gregorian.gy &&
      check.getUTCMonth() === gregorian.gm - 1 &&
      check.getUTCDate() === gregorian.gd
    );
  } catch {
    return false;
  }
}

export function jalaliToGregorian(value: string) {
  const normalized = normalizeDigits(value).trim();

  if (!isValidJalaliDate(normalized)) {
    throw new Error("تاریخ شمسی معتبر نیست.");
  }

  const [jy, jm, jd] = normalized.split("/").map(Number);

  const { gy, gm, gd } = toGregorian(jy, jm, jd);

  return new Date(
    Date.UTC(gy, gm - 1, gd),
  ).toISOString();
}

export function gregorianToJalali(value: string | Date) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const { jy, jm, jd } = toJalaali(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );

  return `${jy}/${pad(jm)}/${pad(jd)}`;
}