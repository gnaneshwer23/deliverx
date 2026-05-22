"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import type { ProjectStructureDraft } from "@/services/aiProjectStructuring";
import { createProjectDraftAction, type ProjectState } from "./actions";

const initial: ProjectState = { ok: false };

const deliveryTypes = [
  "Digital Transformation",
  "Healthcare Transformation",
  "Infrastructure",
  "Product Delivery",
  "Operations",
  "Other",
];

const timelines = ["< 3 months", "3-6 months", "6-12 months", "12+ months"];

type StructureResponse = {
  ok: true;
  draft: ProjectStructureDraft;
};

export function ProjectForm({
  playbookId,
  deliveryTypeDefault,
}: {
  playbookId?: string;
  deliveryTypeDefault?: string;
}) {
  const [state, formAction, pending] = useActionState(
    createProjectDraftAction,
    initial,
  );
  const errorSeen = useRef("");

  useEffect(() => {
    if (state.error && state.error !== errorSeen.current) {
      errorSeen.current = state.error;
      toast.error(state.error);
    }
  }, [state.error]);
  const [brief, setBrief] = useState("");
  const [draft, setDraft] = useState<ProjectStructureDraft | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function generateStructure() {
    const trimmed = brief.trim();
    if (!trimmed) {
      setAiError("Add a business case or brief to generate a structure.");
      return;
    }

    setGenerating(true);
    setAiError(null);

    const res = await postAi<StructureResponse>("/api/ai/structure-project", {
      brief: trimmed,
    });

    setGenerating(false);

    if (!res.ok) {
      setAiError(aiErrorMessage(res));
      return;
    }

    setDraft(res.data.draft);
  }

  return (
    <form action={formAction} className="space-y-4">
      {playbookId ? (
        <input type="hidden" name="playbook_id" value={playbookId} />
      ) : null}
      {draft ? (
        <input type="hidden" name="ai_draft" value={JSON.stringify(draft)} />
      ) : null}

      <Text label="Project name" name="project_name" required placeholder="Patient flow redesign" />
      <Textarea label="Goal" name="goal" placeholder="What outcome should this deliver?" />
      <Select
        label="Delivery type"
        name="delivery_type"
        options={deliveryTypes}
        defaultValue={deliveryTypeDefault}
      />
      <Select label="Timeline" name="timeline" options={timelines} />

      <div className="rounded-xl border border-dashed border-[#0F766E]/30 bg-[#0F766E]/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={14} className="text-[#0F766E]" />
          <span className="text-sm font-semibold text-[#0F766E]">AI structure (optional)</span>
        </div>
        <Textarea
          label="Business case / brief"
          name="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={4}
          placeholder="Paste scope, constraints, stakeholders, and success criteria. Claude will propose workstreams, tasks, and initial RAID items."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={generating || pending}
            onClick={generateStructure}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#0F766E]/30 bg-white px-3 text-sm font-medium text-[#0F766E] transition hover:bg-[#0F766E]/10 disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate structure
              </>
            )}
          </button>
          {draft ? (
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="inline-flex h-9 items-center rounded-md px-3 text-sm text-slate-500 hover:text-slate-700"
            >
              Clear preview
            </button>
          ) : null}
        </div>
        {aiError ? (
          <div className="mt-3">
            <AiStatusBanner message={aiError} />
          </div>
        ) : null}
        {draft ? (
          <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm">
            <p className="font-medium text-slate-800">Preview — review before creating</p>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Workstreams ({draft.workstreams.length})
              </p>
              <ul className="mt-1 space-y-1 text-slate-600">
                {draft.workstreams.slice(0, 6).map((ws, i) => (
                  <li key={i}>
                    {ws.name}
                    {ws.description ? ` — ${ws.description}` : ""}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Tasks ({draft.tasks.length})
              </p>
              <ul className="mt-1 space-y-1 text-slate-600">
                {draft.tasks.slice(0, 8).map((t, i) => (
                  <li key={i}>
                    [{t.priority}] {t.title} → {t.workstreamName}
                  </li>
                ))}
                {draft.tasks.length > 8 ? (
                  <li className="text-slate-400">+{draft.tasks.length - 8} more</li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                RAID ({draft.raidItems.length})
              </p>
              <ul className="mt-1 space-y-1 text-slate-600">
                {draft.raidItems.slice(0, 5).map((r, i) => (
                  <li key={i}>
                    [{r.type}] {r.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || generating}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white transition hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending
          ? "Creating…"
          : draft
            ? "Create project with AI structure →"
            : "Create project →"}
      </button>
    </form>
  );
}

function Text(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...rest}
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
      />
    </label>
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string },
) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        {...rest}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  defaultValue = "",
}: {
  label: string;
  name: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
