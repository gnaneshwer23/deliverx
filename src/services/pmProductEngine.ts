/**
 * Product Manager engine — RICE, guided tasks, cross-role impact, adoption heuristics.
 */

export type RiceScore = {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  score: number;
};

export type ProductFeatureRow = {
  id: string;
  feature_code: string;
  title: string;
  description: string;
  status: string;
  rice: RiceScore;
  horizon: "now" | "next" | "later";
  priority_rank: number;
  linked_stakeholders: string[];
};

export type CustomerInsightRow = {
  id: string;
  theme: string;
  insight_type: string;
  content: string;
  sentiment: string;
  priority: string;
};

export type CustomerSegmentRow = {
  id: string;
  name: string;
  user_count: number;
  revenue: number;
  notes: string | null;
};

export type ProductGuidedTask = {
  id: string;
  title: string;
  priority: string;
  impact: string;
  stakeholders: string;
};

export type CrossRoleProductImpact = {
  role: string;
  message: string;
  tone: "ready" | "waiting" | "blocked" | "updated";
};

export function computeRiceScore(input: {
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
}): number {
  const effort = Math.max(input.effort, 0.5);
  return Math.round(
    ((input.reach * input.impact * (input.confidence / 100)) / effort) * 10,
  ) / 10;
}

export function buildProductGuidedTasks(
  stored: ProductGuidedTask[],
  insights: CustomerInsightRow[],
  features: ProductFeatureRow[],
): ProductGuidedTask[] {
  if (stored.length > 0) return stored.slice(0, 5);

  const tasks: ProductGuidedTask[] = [];
  const highInsights = insights.filter((i) => i.priority === "high").slice(0, 2);

  for (const ins of highInsights) {
    tasks.push({
      id: ins.id,
      title: `Review: ${ins.theme || ins.content.slice(0, 50)}`,
      priority: "high",
      impact: "Retention",
      stakeholders: "Customer, Support",
    });
  }

  const unplanned = features.filter((f) => f.horizon === "now" && f.status === "idea");
  if (unplanned.length > 0) {
    tasks.push({
      id: "prioritise-backlog",
      title: "Prioritise sprint backlog",
      priority: "high",
      impact: "Sprint planning",
      stakeholders: "PM, Engineering",
    });
  }

  tasks.push({
    id: "review-adoption",
    title: "Review feature adoption",
    priority: "medium",
    impact: "Revenue",
    stakeholders: "Founder",
  });

  return tasks.slice(0, 5);
}

export function buildProductCrossRoleImpact(input: {
  roadmapNowCount: number;
  featuresShipped: number;
  highPriorityInsights: number;
}): CrossRoleProductImpact[] {
  return [
    {
      role: "Project Manager",
      message:
        input.roadmapNowCount > 0
          ? "Roadmap updated · scope and priorities changed for Now horizon"
          : "Awaiting roadmap prioritisation",
      tone: input.roadmapNowCount > 0 ? "updated" : "waiting",
    },
    {
      role: "Engineer",
      message: `${input.roadmapNowCount} features in Now · new stories may be required`,
      tone: input.roadmapNowCount > 0 ? "ready" : "waiting",
    },
    {
      role: "QA",
      message:
        input.featuresShipped > 0
          ? "Regression scope may increase with new releases"
          : "No new release tests pending",
      tone: input.featuresShipped > 0 ? "updated" : "waiting",
    },
    {
      role: "Business Analyst",
      message: "Requirements alignment with product roadmap",
      tone: "waiting",
    },
    {
      role: "Founder",
      message:
        input.highPriorityInsights > 0
          ? `${input.highPriorityInsights} high-priority customer signals · strategic review suggested`
          : "Revenue forecast stable · monitor adoption",
      tone: input.highPriorityInsights > 0 ? "blocked" : "ready",
    },
  ];
}

export function buildStakeholderProductConnections(): Array<{
  stakeholder: string;
  dependency: string;
  status: string;
}> {
  return [
    { stakeholder: "Founder", dependency: "Strategy approval", status: "Active" },
    { stakeholder: "Sponsor", dependency: "Investment", status: "Active" },
    { stakeholder: "Project Manager", dependency: "Delivery", status: "Linked" },
    { stakeholder: "BA", dependency: "Requirements", status: "Linked" },
    { stakeholder: "Engineer", dependency: "Feasibility", status: "Linked" },
    { stakeholder: "QA", dependency: "Quality", status: "Linked" },
    { stakeholder: "Customer", dependency: "Feedback", status: "Listening" },
  ];
}

export function computeFeatureAdoptionFromUsage(input: {
  projectsWithCharter: number;
  projectsWithMeetings: number;
  projectsWithReports: number;
  projectsWithBenefits: number;
  totalProjects: number;
}): Array<{ feature: string; adoption: number }> {
  const t = Math.max(input.totalProjects, 1);
  return [
    { feature: "Business case / Charter", adoption: Math.round((input.projectsWithCharter / t) * 100) },
    { feature: "AI Workspace", adoption: Math.round((input.projectsWithCharter / t) * 85) },
    { feature: "Meeting intelligence", adoption: Math.round((input.projectsWithMeetings / t) * 100) },
    { feature: "RAID & governance", adoption: Math.round(((input.projectsWithMeetings + input.projectsWithCharter) / (t * 2)) * 100) },
    { feature: "Benefits tracker", adoption: Math.round((input.projectsWithBenefits / t) * 100) },
    { feature: "Reports pipeline", adoption: Math.round((input.projectsWithReports / t) * 100) },
  ];
}

export function computeProductHealth(input: {
  featureAdoptionAvg: number;
  roadmapNowProgress: number;
  insightSentimentPositive: number;
}): number {
  return Math.round(
    input.featureAdoptionAvg * 0.4 +
      input.roadmapNowProgress * 0.35 +
      input.insightSentimentPositive * 0.25,
  );
}
