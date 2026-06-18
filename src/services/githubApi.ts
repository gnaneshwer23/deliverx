/**
 * GitHub REST API client (server-only).
 */

import type { GitHubPullRequest, GitHubWorkflowRun } from "./githubIntegrationEngine";

const GITHUB_API = "https://api.github.com";

async function githubFetch<T>(
  path: string,
  token: string,
): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail.slice(0, 200) || `GitHub API error (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function fetchOpenPullRequests(input: {
  owner: string;
  repo: string;
  token: string;
}): Promise<GitHubPullRequest[]> {
  return githubFetch<GitHubPullRequest[]>(
    `/repos/${input.owner}/${input.repo}/pulls?state=open&per_page=20`,
    input.token,
  );
}

export async function fetchRecentWorkflowRuns(input: {
  owner: string;
  repo: string;
  token: string;
}): Promise<GitHubWorkflowRun[]> {
  const payload = await githubFetch<{ workflow_runs: GitHubWorkflowRun[] }>(
    `/repos/${input.owner}/${input.repo}/actions/runs?per_page=8`,
    input.token,
  );
  return payload.workflow_runs ?? [];
}

export async function verifyGitHubCredentials(input: {
  owner: string;
  repo: string;
  token: string;
}): Promise<{ ok: boolean; repoName?: string; error?: string }> {
  try {
    const repo = await githubFetch<{ full_name: string }>(
      `/repos/${input.owner}/${input.repo}`,
      input.token,
    );
    return { ok: true, repoName: repo.full_name };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "GitHub verification failed",
    };
  }
}
