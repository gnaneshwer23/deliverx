/**
 * GitHub integration — pure parsing and CI/PR mapping.
 */

export type GitHubPullRequest = {
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string };
  draft: boolean;
  created_at: string;
  updated_at: string;
};

export type GitHubWorkflowRun = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  head_branch: string;
  created_at: string;
  updated_at: string;
};

export type GitHubCiSummary = {
  buildStatus: "Success" | "Failed" | "Running" | "Unknown";
  deployment: string;
  testCoverage: number | null;
  failedTests: number;
  lastDeployment: string;
  workflowUrl: string | null;
};

export function parseGitHubPrUrl(url: string): { owner: string; repo: string; number: number } | null {
  const match = url.trim().match(
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i,
  );
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
    number: Number(match[3]),
  };
}

export function mapPullRequestsToLinks(
  prs: GitHubPullRequest[],
): Array<{
  link_type: "pull_request";
  external_id: string;
  external_url: string;
  title: string;
  status: string;
  metadata: Record<string, unknown>;
}> {
  return prs.map((pr) => ({
    link_type: "pull_request",
    external_id: String(pr.number),
    external_url: pr.html_url,
    title: pr.title,
    status: pr.draft ? "draft" : pr.state,
    metadata: {
      author: pr.user.login,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
    },
  }));
}

export function summarizeCiFromWorkflows(runs: GitHubWorkflowRun[]): GitHubCiSummary {
  if (runs.length === 0) {
    return {
      buildStatus: "Unknown",
      deployment: "—",
      testCoverage: null,
      failedTests: 0,
      lastDeployment: "Never synced",
      workflowUrl: null,
    };
  }

  const latest = runs[0];
  const failed = runs.filter((r) => r.conclusion === "failure").length;
  const running = latest.status === "in_progress" || latest.status === "queued";

  let buildStatus: GitHubCiSummary["buildStatus"] = "Unknown";
  if (running) buildStatus = "Running";
  else if (latest.conclusion === "success") buildStatus = "Success";
  else if (latest.conclusion === "failure") buildStatus = "Failed";
  else if (latest.conclusion === "cancelled") buildStatus = "Failed";

  const lastDeployment = formatRelativeTime(latest.updated_at);

  return {
    buildStatus,
    deployment: latest.head_branch || "main",
    testCoverage: null,
    failedTests: failed,
    lastDeployment,
    workflowUrl: latest.html_url,
  };
}

export function buildHealthFromCi(
  ci: GitHubCiSummary,
  openPrCount: number,
  blockedTasks: number,
): "green" | "amber" | "red" {
  if (ci.buildStatus === "Failed") return "red";
  if (blockedTasks > 0 || openPrCount > 5) return "amber";
  if (ci.buildStatus === "Running") return "amber";
  return "green";
}

export function computePrDashboardStats(
  prs: Array<{ status: string | null; metadata: Record<string, unknown> }>,
): { openPrs: number; reviewsRequired: number; avgReviewHours: number } {
  const open = prs.filter((p) => p.status !== "closed");
  const reviewsRequired = open.filter((p) => p.status !== "draft").length;
  const ages = open
    .map((p) => {
      const created = p.metadata.created_at;
      if (typeof created !== "string") return null;
      return (Date.now() - new Date(created).getTime()) / 3_600_000;
    })
    .filter((h): h is number => h !== null && Number.isFinite(h));

  const avgReviewHours =
    ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 0;

  return {
    openPrs: open.length,
    reviewsRequired,
    avgReviewHours,
  };
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diffMs / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
