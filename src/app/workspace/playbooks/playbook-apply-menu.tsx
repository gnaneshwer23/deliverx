"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

type Project = { id: string; name: string };

export function PlaybookApplyMenu({
  playbookId,
  projects,
}: {
  playbookId: string;
  projects: Project[];
}) {
  const [projectId, setProjectId] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function applyToProject() {
    if (!projectId) {
      setError("Select a project first.");
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/playbook/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbookId, projectId }),
      });
      const data = (await res.json()) as { error?: string; project?: { name: string } };
      if (!res.ok) {
        setError(data.error ?? "Could not apply playbook");
        return;
      }
      setMessage(`Applied to ${data.project?.name ?? "project"}.`);
    } catch {
      setError("Network error applying playbook.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <Link
        href={`/project/new?playbook=${encodeURIComponent(playbookId)}`}
        className={`${dxClass.btnPrimary} inline-flex h-9 w-full items-center justify-center text-[10px]`}
      >
        New project from playbook
      </Link>

      {projects.length > 0 ? (
        <div className="border border-[#E4E4DC] bg-[#F7F7F2] p-3">
          <p className={`${dxClass.label} mb-2`}>Or apply to existing</p>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className={`${dxClass.input} mb-2 text-sm`}
          >
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending}
            onClick={applyToProject}
            className={`${dxClass.btnGhost} w-full text-[10px]`}
          >
            {pending ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Applying…
              </>
            ) : (
              "Apply playbook"
            )}
          </button>
        </div>
      ) : null}

      {error ? <p className="text-xs text-[#C0392B]">{error}</p> : null}
      {message ? <p className="text-xs text-[#1A6B3A]">{message}</p> : null}
    </div>
  );
}
