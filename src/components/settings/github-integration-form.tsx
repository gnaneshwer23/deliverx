"use client";

import { useActionState, useState, useTransition } from "react";
import { GitBranch, Plug } from "lucide-react";
import { useFormToast } from "@/hooks/use-form-toast";
import {
  saveGitHubOrgSettingsAction,
  saveGitHubProjectSettingsAction,
  testGitHubConnectionAction,
  type SettingsState,
} from "@/app/workspace/settings/actions";
import type {
  OrgIntegrationSettings,
  ProjectIntegrationSettings,
} from "@/services/githubIntegration";

const initial: SettingsState = { ok: false };

export function GitHubIntegrationForm({
  webhookUrl,
  orgSettings,
  projects,
  projectSettings,
}: {
  webhookUrl: string | null;
  orgSettings: OrgIntegrationSettings | null;
  projects: Array<{ id: string; name: string }>;
  projectSettings: Record<string, ProjectIntegrationSettings | null>;
}) {
  const [orgState, orgAction, orgPending] = useActionState(
    saveGitHubOrgSettingsAction,
    initial,
  );
  const [projectState, projectAction, projectPending] = useActionState(
    saveGitHubProjectSettingsAction,
    initial,
  );
  const [testState, testAction] = useActionState(testGitHubConnectionAction, initial);
  const [, startTest] = useTransition();

  useFormToast(orgState, { success: "GitHub org settings saved" });
  useFormToast(projectState, { success: "Project repository mapping saved" });
  useFormToast(testState, { success: "GitHub connection verified" });

  const defaultProjectId = projects[0]?.id ?? "";
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId);
  const selectedSettings = projectSettings[selectedProjectId];
  const [githubOwner, setGithubOwner] = useState(selectedSettings?.github_owner ?? "");
  const [githubRepo, setGithubRepo] = useState(selectedSettings?.github_repo ?? "");

  function onProjectChange(projectId: string) {
    setSelectedProjectId(projectId);
    const settings = projectSettings[projectId];
    setGithubOwner(settings?.github_owner ?? "");
    setGithubRepo(settings?.github_repo ?? "");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3">
        <GitBranch size={20} className="mt-0.5 text-[#0F766E]" />
        <p className="text-sm text-[#6B6B64]">
          Connect GitHub to sync open PRs and CI workflow status into Engineer Mission
          Control. Use a fine-grained PAT with repo read access.
        </p>
      </div>

      <form action={orgAction} className="space-y-4 rounded-lg border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Organisation token</h3>
        <div>
          <label htmlFor="github_token" className="mb-1 block text-sm font-medium text-slate-700">
            GitHub personal access token
          </label>
          <input
            id="github_token"
            name="github_token"
            type="password"
            autoComplete="off"
            placeholder={orgSettings?.github_token ? "•••••••• (saved — leave blank to keep)" : "ghp_…"}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="github_webhook_secret"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Webhook secret (optional)
          </label>
          <input
            id="github_webhook_secret"
            name="github_webhook_secret"
            type="password"
            autoComplete="off"
            placeholder="Required for inbound webhook ingestion"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {webhookUrl ? (
            <p className="mt-2 text-xs text-[#6B6B64]">
              Webhook URL:{" "}
              <code className="break-all rounded bg-[#F7F7F2] px-1 py-0.5">{webhookUrl}</code>
            </p>
          ) : null}
          <p className="mt-1 text-xs text-[#6B6B64]">
            Subscribe to pull_request, workflow_run, and push events in GitHub.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={orgSettings?.enabled ?? false}
            className="rounded border-slate-300"
          />
          Enable GitHub integration
        </label>
        <button
          type="submit"
          disabled={orgPending}
          className="inline-flex h-9 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
        >
          {orgPending ? "Saving…" : "Save org settings"}
        </button>
      </form>

      {projects.length > 0 ? (
        <form action={projectAction} className="space-y-4 rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Project repository</h3>
          <div>
            <label htmlFor="project_id" className="mb-1 block text-sm font-medium text-slate-700">
              Project
            </label>
            <select
              id="project_id"
              name="project_id"
              value={selectedProjectId}
              onChange={(e) => onProjectChange(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="github_owner" className="mb-1 block text-sm font-medium text-slate-700">
                Owner
              </label>
              <input
                id="github_owner"
                name="github_owner"
                value={githubOwner}
                onChange={(e) => setGithubOwner(e.target.value)}
                placeholder="acme-corp"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="github_repo" className="mb-1 block text-sm font-medium text-slate-700">
                Repository
              </label>
              <input
                id="github_repo"
                name="github_repo"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="deliverx"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={projectPending}
              className="inline-flex h-9 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
            >
              {projectPending ? "Saving…" : "Save project mapping"}
            </button>
            <button
              type="button"
              disabled={projectPending}
              onClick={() => {
                const fd = new FormData();
                fd.set("github_owner", githubOwner);
                fd.set("github_repo", githubRepo);
                startTest(() => testAction(fd));
              }}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <Plug size={14} />
              Test connection
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-[#6B6B64]">Create a project to map a GitHub repository.</p>
      )}

      {(orgState.error || projectState.error || testState.error) && (
        <p className="text-sm text-rose-600">
          {orgState.error ?? projectState.error ?? testState.error}
        </p>
      )}
    </div>
  );
}
