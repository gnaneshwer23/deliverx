"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

const PERSONA_LABELS: Record<string, string> = {
  ba: "Business Analyst",
  product: "Product",
  pm: "Delivery PM",
  engineer: "Engineering",
  scrum: "Scrum Master",
  qa: "QA",
  founder: "Founder",
};

export function ProjectBootstrapPanel({
  projectId,
  initialStatus,
  summary,
}: {
  projectId: string;
  initialStatus: string;
  summary: Record<string, unknown>;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [personas, setPersonas] = useState<Record<string, { ok: boolean; error?: string }>>(
    () => ((summary.personas as Record<string, { ok: boolean; error?: string }>) ?? {}),
  );

  useEffect(() => {
    if (status !== "pending" && status !== "running") return;

    let cancelled = false;

    async function poll() {
      const res = await fetch(`/api/project/${projectId}/bootstrap`);
      const data = (await res.json()) as {
        status?: string;
        summary?: { personas?: Record<string, { ok: boolean; error?: string }> };
      };
      if (cancelled || !res.ok) return;
      if (data.status) setStatus(data.status);
      if (data.summary?.personas) setPersonas(data.summary.personas);
      if (data.status === "pending" || data.status === "running") {
        window.setTimeout(poll, 3000);
      }
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [projectId, status]);

  if (status === "skipped" || status === "complete") return null;

  const isRunning = status === "pending" || status === "running";
  const failed = Object.entries(personas).filter(([, p]) => !p.ok);

  return (
    <div
      className={`mb-6 border px-4 py-3 text-sm ${
        status === "partial"
          ? "border-[#B8860B]/40 bg-[#FEF6EC] text-[#8B6914]"
          : "border-[#C6DDD0] bg-[#EEF5F1] text-[#1C4A2E]"
      }`}
    >
      <div className="flex items-center gap-2 font-medium">
        {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {isRunning
          ? "Generating delivery workspaces for all personas…"
          : status === "partial"
            ? "Workspace bootstrap completed with warnings"
            : "Workspace bootstrap"}
      </div>
      {Object.keys(personas).length > 0 ? (
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {Object.entries(personas).map(([key, result]) => (
            <li key={key} className="text-xs">
              {PERSONA_LABELS[key] ?? key}: {result.ok ? "ready" : `failed — ${result.error}`}
            </li>
          ))}
        </ul>
      ) : isRunning ? (
        <p className="mt-1 text-xs text-[#6B6B64]">
          Seeding persona contexts. AI-generated structure, requirements, and features will appear
          in the{" "}
          <a href="/workspace/proposals" className="font-medium text-[#1C4A2E] underline">
            Approval centre
          </a>{" "}
          for sign-off.
        </p>
      ) : null}
      {status === "partial" && failed.length > 0 ? (
        <button
          type="button"
          className={`${dxClass.btnGhost} mt-3 text-[10px]`}
          onClick={() => {
            void fetch(`/api/project/${projectId}/bootstrap`, { method: "POST" }).then(() => {
              setStatus("running");
            });
          }}
        >
          Retry bootstrap
        </button>
      ) : null}
    </div>
  );
}
