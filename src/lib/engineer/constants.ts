export const ENGINEER_SPECIALISATIONS = [
  { value: "frontend", label: "Frontend Engineer" },
  { value: "backend", label: "Backend Engineer" },
  { value: "fullstack", label: "Full Stack Engineer" },
  { value: "ai_ml", label: "AI/ML Engineer" },
  { value: "data", label: "Data Engineer" },
  { value: "devops", label: "DevOps Engineer" },
  { value: "mobile", label: "Mobile Engineer" },
  { value: "security", label: "Security Engineer" },
] as const;

export const ENGINEER_TECH_STACK = {
  frontend: ["React", "Next.js", "Flutter"],
  backend: ["Node.js", "FastAPI", "Java", ".NET"],
  cloud: ["AWS", "Azure", "GCP"],
} as const;

export const DEFAULT_ARCHITECTURE_LAYERS = [
  "Frontend",
  "API Gateway",
  "AI Services",
  "Workflow Engine",
  "Knowledge Graph",
  "Postgres",
  "Vector Store",
] as const;
