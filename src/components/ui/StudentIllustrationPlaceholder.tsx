import { CakeSlice, Medal, School, Star, UserRound, UserRoundX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StudentIllustrationVariant = "top" | "outstanding" | "birthday" | "absence" | "class-list";

const variants: Record<StudentIllustrationVariant, { label: string; frame: string; accent: string; Badge: LucideIcon }> = {
  top: { label: "جای تصویر دانش‌آموز برتر", frame: "bg-[#FFF7DA] text-[#7A5A13]", accent: "bg-[#E8C85A]", Badge: Medal },
  outstanding: { label: "جای تصویر دانش‌آموز ممتاز", frame: "bg-[#EDF5E8] text-[#315B46]", accent: "bg-[#9CC78C]", Badge: Star },
  birthday: { label: "جای تصویر دانش‌آموز متولد امروز", frame: "bg-[#F8ECE8] text-[#8F5144]", accent: "bg-[#DFA28F]", Badge: CakeSlice },
  absence: { label: "جای تصویر دانش‌آموز غایب", frame: "bg-[#EEF2F6] text-[#536273]", accent: "bg-[#AEB9C5]", Badge: UserRoundX },
  "class-list": { label: "جای تصویر دانش‌آموز کلاس", frame: "bg-[#EEF4EF] text-[#315B46]", accent: "bg-[#A9C7B1]", Badge: School },
};

export default function StudentIllustrationPlaceholder({ variant, className }: { variant: StudentIllustrationVariant; className?: string }) {
  const config = variants[variant];
  const Badge = config.Badge;

  return (
    <div role="img" aria-label={config.label} className={cn("relative aspect-square w-16 shrink-0 overflow-hidden rounded-2xl", config.frame, className)}>
      <div className="absolute inset-x-2 bottom-[-28%] aspect-square rounded-full bg-current opacity-10" />
      <UserRound className="absolute inset-0 m-auto h-[52%] w-[52%]" strokeWidth={1.45} />
      <span className={cn("absolute bottom-1.5 left-1.5 flex h-[28%] w-[28%] items-center justify-center rounded-full text-white shadow-sm", config.accent)}>
        <Badge className="h-[62%] w-[62%]" strokeWidth={1.8} />
      </span>
    </div>
  );
}
