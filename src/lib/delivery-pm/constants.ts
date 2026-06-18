export const PM_PROJECT_TYPES = [
  { value: "saas", label: "SaaS Product" },
  { value: "ai_platform", label: "AI Platform" },
  { value: "client_delivery", label: "Client Delivery" },
  { value: "healthcare", label: "Healthcare Programme" },
  { value: "education", label: "Education Programme" },
  { value: "internal_transformation", label: "Internal Transformation" },
  { value: "enterprise_rollout", label: "Enterprise Rollout" },
] as const;

export const DEFAULT_MILESTONE_PHASES = [
  "Discovery",
  "Design",
  "Build",
  "Testing",
  "UAT",
  "Go Live",
  "Hypercare",
  "Benefits",
] as const;
