import { toJalaali } from "jalaali-js";

export function getTodayJalaliDateString() {
  const now = new Date();
  const { jy, jm, jd } = toJalaali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );

  const month = String(jm).padStart(2, "0");
  const day = String(jd).padStart(2, "0");

  return `${jy}/${month}/${day}`;
}

export function isUpcomingEventDate(date: string) {
  const normalized = date.replaceAll("-", "/").trim();
  return normalized >= getTodayJalaliDateString();
}
