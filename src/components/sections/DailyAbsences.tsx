import { prisma } from "@/lib/prisma";
import DailyAbsencesSlider from "./DailyAbsencesSlider";

const todayKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export default async function DailyAbsences() {
  const absences = await prisma.dailyAbsence.findMany({
    where: { dateKey: todayKey() },
    orderBy: [{ grade: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      grade: true,
      dateKey: true,
    },
  });

  if (absences.length === 0) return null;

  return <DailyAbsencesSlider absences={absences} />;
}
