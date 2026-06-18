/**
 * GitHub inbound webhook engine — signature verification and payload parsing.
 */

import { createHmac, timingSafeEqual } from "crypto";

export const GITHUB_WEBHOOK_EVENTS = [
  "pull_request",
  "workflow_run",
  "push",
] as const;

export type GitHubWebhookEvent = (typeof GITHUB_WEBHOOK_EVENTS)[number];

export function verifyGitHubWebhookSignature(
  secret: string,
  payload: string,
  signatureHeader: string | null,
): boolean {
  if (!secret.trim() || !signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", secret).update(payload).digest();
  const received = Buffer.from(signatureHeader.slice("sha256=".length), "hex");

  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

export function parseGitHubRepository(
  payload: Record<string, unknown>,
): { owner: string; repo: string } | null {
  const repository = payload.repository as { full_name?: string; owner?: { login?: string }; name?: string } | undefined;
  if (!repository) return null;

  if (repository.full_name?.includes("/")) {
    const [owner, repo] = repository.full_name.split("/");
    if (owner && repo) return { owner, repo };
  }

  if (repository.owner?.login && repository.name) {
    return { owner: repository.owner.login, repo: repository.name };
  }

  return null;
}

export function isSupportedGitHubWebhookEvent(event: string): event is GitHubWebhookEvent {
  return (GITHUB_WEBHOOK_EVENTS as readonly string[]).includes(event);
}

export function extractPullRequestLink(payload: Record<string, unknown>) {
  const pullRequest = payload.pull_request as
    | {
        number?: number;
        title?: string;
        state?: string;
        draft?: boolean;
        html_url?: string;
        user?: { login?: string };
        created_at?: string;
        updated_at?: string;
      }
    | undefined;

  if (!pullRequest?.number || !pullRequest.html_url) return null;

  return {
    link_type: "pull_request" as const,
    external_id: String(pullRequest.number),
    external_url: pullRequest.html_url,
    title: pullRequest.title ?? `PR #${pullRequest.number}`,
    status: pullRequest.draft ? "draft" : (pullRequest.state ?? "open"),
    metadata: {
      author: pullRequest.user?.login ?? "unknown",
      created_at: pullRequest.created_at,
      updated_at: pullRequest.updated_at,
      action: payload.action,
    },
  };
}

export function extractWorkflowRunSummary(payload: Record<string, unknown>) {
  const run = payload.workflow_run as
    | {
        id?: number;
        name?: string;
        status?: string;
        conclusion?: string | null;
        html_url?: string;
        head_branch?: string;
        updated_at?: string;
      }
    | undefined;

  if (!run?.id) return null;

  const running = run.status === "in_progress" || run.status === "queued";
  let buildStatus: "Success" | "Failed" | "Running" | "Unknown" = "Unknown";
  if (running) buildStatus = "Running";
  else if (run.conclusion === "success") buildStatus = "Success";
  else if (run.conclusion === "failure" || run.conclusion === "cancelled") buildStatus = "Failed";

  return {
    link_type: "ci_summary" as const,
    external_id: "latest",
    external_url: run.html_url ?? "",
    title: `CI: ${buildStatus}`,
    status: buildStatus.toLowerCase(),
    metadata: {
      buildStatus,
      deployment: run.head_branch ?? "main",
      testCoverage: null,
      failedTests: run.conclusion === "failure" ? 1 : 0,
      lastDeployment: run.updated_at ?? new Date().toISOString(),
      workflowUrl: run.html_url ?? null,
      workflowRunId: run.id,
      action: payload.action,
    },
  };
}

export function runGitHubWebhookEngineSmokeTest(): {
  ok: boolean;
  eventCount: number;
} {
  const payload = JSON.stringify({ repository: { full_name: "acme/core" } });
  const secret = "test-secret";
  const signature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

  const repo = parseGitHubRepository({ repository: { full_name: "acme/core" } });
  const pr = extractPullRequestLink({
    action: "opened",
    pull_request: {
      number: 42,
      title: "Add webhook",
      state: "open",
      html_url: "https://github.com/acme/core/pull/42",
      user: { login: "dev" },
      created_at: "2026-05-22T12:00:00Z",
      updated_at: "2026-05-22T12:00:00Z",
    },
  });

  return {
    ok:
      verifyGitHubWebhookSignature(secret, payload, signature) &&
      repo?.owner === "acme" &&
      repo.repo === "core" &&
      pr?.external_id === "42" &&
      isSupportedGitHubWebhookEvent("pull_request"),
    eventCount: GITHUB_WEBHOOK_EVENTS.length,
  };
}
