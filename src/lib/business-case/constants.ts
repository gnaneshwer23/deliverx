export type BusinessCaseRecommendation = "go" | "conditional_go" | "no_go";

export function businessCaseRecommendationLabel(
  recommendation: BusinessCaseRecommendation,
): string {
  if (recommendation === "go") return "Go";
  if (recommendation === "no_go") return "No-Go";
  return "Conditional Go";
}
