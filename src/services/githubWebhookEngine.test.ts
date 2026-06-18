import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import {
  extractPullRequestLink,
  extractWorkflowRunSummary,
  isSupportedGitHubWebhookEvent,
  parseGitHubRepository,
  runGitHubWebhookEngineSmokeTest,
  verifyGitHubWebhookSignature,
} from "./githubWebhookEngine";

describe("githubWebhookEngine", () => {
  it("verifies GitHub webhook signatures", () => {
    const payload = '{"ok":true}';
    const secret = "webhook-secret";
    const signature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

    expect(verifyGitHubWebhookSignature(secret, payload, signature)).toBe(true);
    expect(verifyGitHubWebhookSignature(secret, payload, "sha256=deadbeef")).toBe(false);
  });

  it("parses repository coordinates", () => {
    expect(parseGitHubRepository({ repository: { full_name: "org/repo" } })).toEqual({
      owner: "org",
      repo: "repo",
    });
  });

  it("extracts pull request links", () => {
    const link = extractPullRequestLink({
      action: "opened",
      pull_request: {
        number: 7,
        title: "Fix",
        state: "open",
        html_url: "https://github.com/org/repo/pull/7",
      },
    });
    expect(link?.external_id).toBe("7");
  });

  it("extracts workflow run summaries", () => {
    const summary = extractWorkflowRunSummary({
      action: "completed",
      workflow_run: {
        id: 99,
        status: "completed",
        conclusion: "success",
        html_url: "https://github.com/org/repo/actions/runs/99",
        head_branch: "main",
        updated_at: "2026-05-22T12:00:00Z",
      },
    });
    expect(summary?.metadata.buildStatus).toBe("Success");
  });

  it("recognizes supported events", () => {
    expect(isSupportedGitHubWebhookEvent("push")).toBe(true);
    expect(isSupportedGitHubWebhookEvent("issues")).toBe(false);
  });

  it("passes smoke test", () => {
    expect(runGitHubWebhookEngineSmokeTest().ok).toBe(true);
  });
});
