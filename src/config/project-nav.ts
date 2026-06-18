export type ProjectNavItem = {
  label: string;
  segment: string;
};

export type ProjectNavSection = {
  label: string;
  items: ProjectNavItem[];
};

/** Static project routes (segment appended to /project/[id]/). */
export const projectNavSections: ProjectNavSection[] = [
  {
    label: "Business analysis",
    items: [
      { label: "Requirements", segment: "requirements" },
      { label: "Charter", segment: "charter" },
    ],
  },
  {
    label: "Product",
    items: [{ label: "Product workspace", segment: "product" }],
  },
  {
    label: "Engineering",
    items: [{ label: "Engineering workspace", segment: "engineering" }],
  },
  {
    label: "Scrum",
    items: [{ label: "Scrum workspace", segment: "scrum" }],
  },
  {
    label: "QA",
    items: [{ label: "QA workspace", segment: "qa" }],
  },
  {
    label: "Delivery PM",
    items: [{ label: "Delivery workspace", segment: "delivery" }],
  },
  {
    label: "Project",
    items: [{ label: "Overview", segment: "" }],
  },
  {
    label: "Delivery",
    items: [
      { label: "Workstreams", segment: "workstreams" },
      { label: "Tasks", segment: "tasks" },
      { label: "Milestones", segment: "milestones" },
      { label: "Meetings", segment: "meetings" },
      { label: "Standups", segment: "standups" },
    ],
  },
  {
    label: "Outcomes",
    items: [
      { label: "Benefits", segment: "benefits" },
      { label: "Closure", segment: "closure" },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "RAID", segment: "raid" },
      { label: "Decisions", segment: "decisions" },
      { label: "Documents", segment: "documents" },
      { label: "Changes", segment: "changes" },
      { label: "Reports", segment: "reports" },
    ],
  },
  {
    label: "People & trace",
    items: [
      { label: "Stakeholders", segment: "stakeholders" },
      { label: "Traceability", segment: "traceability" },
    ],
  },
];

export const projectQuickNavSegments = [
  "tasks",
  "milestones",
  "benefits",
  "meetings",
  "decisions",
  "raid",
  "changes",
  "standups",
  "reports",
  "closure",
  "traceability",
  "workstreams",
] as const;

export function projectHref(projectId: string, segment: string): string {
  if (!segment) return `/project/${projectId}`;
  return `/project/${projectId}/${segment}`;
}

export function allProjectNavSegments(): string[] {
  const fromSections = projectNavSections.flatMap((section) =>
    section.items.map((item) => item.segment).filter(Boolean),
  );
  return [...new Set([...fromSections, ...projectQuickNavSegments])];
}
