import { describe, expect, it } from "vitest";
import {
  buildHealthFromCi,
  computePrDashboardStats,
  mapPullRequestsToLinks,
  parseGitHubPrUrl,
  summarizeCiFromWorkflows,
} from "@/services/githubIntegrationEngine";

describe("parseGitHubPrUrl", () => {
  it("parses standard GitHub PR URLs", () => {
    expect(parseGitHubPrUrl("https://github.com/acme/app/pull/42")).toEqual({
      owner: "acme",
      repo: "app",
      number: 42,
    });
  });

  it("returns null for invalid URLs", () => {
    expect(parseGitHubPrUrl("https://gitlab.com/a/b/merge_requests/1")).toBeNull();
  });
});

describe("mapPullRequestsToLinks", () => {
  it("maps open PRs to external link rows", () => {
    const links = mapPullRequestsToLinks([
      {
        number: 7,
        title: "Add auth",
        state: "open",
        html_url: "https://github.com/o/r/pull/7",
        user: { login: "dev1" },
        draft: false,
        created_at: "2026-05-01T10:00:00Z",
        updated_at: "2026-05-02T10:00:00Z",
      },
    ]);

    expect(links).toHaveLength(1);
    expect(links[0].external_id).toBe("7");
    expect(links[0].status).toBe("open");
    expect(links[0].metadata.author).toBe("dev1");
  });
});

describe("summarizeCiFromWorkflows", () => {
  it("returns unknown when no runs", () => {
    const ci = summarizeCiFromWorkflows([]);
    expect(ci.buildStatus).toBe("Unknown");
    expect(ci.lastDeployment).toBe("Never synced");
  });

  it("marks latest success run as Success", () => {
    const ci = summarizeCiFromWorkflows([
      {
        id: 1,
        name: "CI",
        status: "completed",
        conclusion: "success",
        html_url: "https://github.com/o/r/actions/runs/1",
        head_branch: "main",
        created_at: "2026-05-01T10:00:00Z",
        updated_at: "2026-05-01T11:00:00Z",
      },
    ]);
    expect(ci.buildStatus).toBe("Success");
    expect(ci.deployment).toBe("main");
  });
});

describe("buildHealthFromCi", () => {
  it("returns red on failed CI", () => {
    expect(
      buildHealthFromCi(
        {
          buildStatus: "Failed",
          deployment: "main",
          testCoverage: null,
          failedTests: 1,
          lastDeployment: "1 hr ago",
          workflowUrl: null,
        },
        1,
        0,
      ),
    ).toBe("red");
  });
});

describe("computePrDashboardStats", () => {
  it("counts open PRs and review queue", () => {
    const stats = computePrDashboardStats([
      {
        status: "open",
        metadata: { created_at: new Date(Date.now() - 6 * 3_600_000).toISOString() },
      },
      { status: "draft", metadata: {} },
    ]);
    expect(stats.openPrs).toBe(2);
    expect(stats.reviewsRequired).toBe(1);
    expect(stats.avgReviewHours).toBeGreaterThan(0);
  });
});
