"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { useFormToast } from "@/hooks/use-form-toast";
import type { CharterRow } from "@/services/charter";
import type { AlignmentScoreRow } from "@/services/charter";
import { saveCharterAction, scoreAlignmentAction, type ActionState } from "./actions";

const initial: ActionState = { ok: false };

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2";

export function CharterForm({
  projectId,
  charter,
}: {
  projectId: string;
  charter: CharterRow | null;
}) {
  const [saveState, saveAction, savePending] = useActionState(saveCharterAction, initial);
  const [scoreState, scoreAction, scorePending] = useActionState(scoreAlignmentAction, initial);
  useFormToast(saveState, { success: "Charter saved" });
  useFormToast(scoreState, { success: "Alignment score updated" });

  return (
    <div className="space-y-6">
      <form action={saveAction} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <input type="hidden" name="projectId" value={projectId} />
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#0F766E]" />
          <h2 className="font-semibold">Project charter</h2>
        </div>
        <p className="text-sm text-slate-500">
          Paste your charter, business case, or scope document. DeliverX scores how well delivery
          tracks this intent.
        </p>
        <label className="block text-sm font-medium text-slate-700">
          Title
          <input
            name="title"
            defaultValue={charter?.title ?? ""}
            placeholder="Program charter"
            className={`${inputClass} h-10`}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Charter content
          <textarea
            name="content"
            rows={14}
            required
            defaultValue={charter?.content ?? ""}
            placeholder="Goals, scope, success criteria, constraints, stakeholders…"
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" name="extractWithAi" defaultChecked />
          Extract goals & success criteria with AI
        </label>
        {charter?.extracted_goals?.length ? (
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Extracted goals</p>
            <ul className="list-inside list-disc text-slate-600">
              {charter.extracted_goals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {saveState.error ? (
          <p className="text-sm text-red-600">{saveState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={savePending}
          className="inline-flex h-10 items-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {savePending ? "Saving…" : "Save charter"}
        </button>
      </form>

      <form action={scoreAction} className="rounded-xl border border-dashed border-[#0F766E]/30 bg-[#0F766E]/5 p-6">
        <input type="hidden" name="projectId" value={projectId} />
        <h3 className="font-semibold text-[#0F766E]">Alignment score</h3>
        <p className="mt-1 text-sm text-slate-600">
          Compare live tasks, RAID, and decisions against your charter. Uses heuristics + Claude when
          configured.
        </p>
        {scoreState.error ? (
          <p className="mt-2 text-sm text-red-600">{scoreState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={scorePending || !charter?.content}
          className="mt-4 inline-flex h-10 items-center rounded-md border border-[#0F766E]/30 bg-white px-4 text-sm font-medium text-[#0F766E] disabled:opacity-50"
        >
          {scorePending ? "Scoring…" : "Re-score alignment"}
        </button>
      </form>
    </div>
  );
}

export function AlignmentHistory({ scores }: { scores: AlignmentScoreRow[] }) {
  if (scores.length === 0) {
    return (
      <p className="text-sm text-slate-500">No alignment scores yet — save a charter and re-score.</p>
    );
  }

  return (
    <ul className="space-y-2 text-sm">
      {scores.map((s) => (
        <li
          key={s.id}
          className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2"
        >
          <span className="text-slate-600">{new Date(s.computed_at).toLocaleString()}</span>
          <span className="font-semibold tabular-nums">
            {s.score}%
            {s.delta != null ? (
              <span
                className={`ml-2 text-xs font-medium ${
                  s.delta > 0 ? "text-green-600" : s.delta < 0 ? "text-red-600" : "text-slate-400"
                }`}
              >
                {s.delta > 0 ? "+" : ""}
                {s.delta}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
