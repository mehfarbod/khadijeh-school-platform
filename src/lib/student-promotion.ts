export const promotionOutcomes = ["PROMOTE", "REPEAT", "NEEDS_DECISION"] as const;
export type PromotionOutcome = (typeof promotionOutcomes)[number];

export function suggestedPromotionOutcome(grade: string): PromotionOutcome {
  return grade === "10" || grade === "11" ? "PROMOTE" : "NEEDS_DECISION";
}

export function getTargetGrade(grade: string, outcome: PromotionOutcome) {
  if (outcome === "REPEAT") return grade;
  if (outcome === "PROMOTE") {
    if (grade === "10") return "11";
    if (grade === "11") return "12";
  }
  return null;
}
