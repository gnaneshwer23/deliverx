export const SCRUM_FRAMEWORKS = [
  { value: "scrum", label: "Scrum" },
  { value: "kanban", label: "Kanban" },
  { value: "safe", label: "SAFe" },
  { value: "hybrid", label: "Hybrid Agile" },
  { value: "lean", label: "Lean Delivery" },
] as const;

export const SCRUM_TEAM_CONFIGS = [
  { value: "engineering", label: "Engineering Team" },
  { value: "product", label: "Product Team" },
  { value: "cross_functional", label: "Cross-functional Team" },
  { value: "multi_team", label: "Multi-team Delivery" },
] as const;

export const SCRUM_CEREMONIES = [
  "Sprint Planning",
  "Daily Standup",
  "Refinement",
  "Review",
  "Retrospective",
] as const;
