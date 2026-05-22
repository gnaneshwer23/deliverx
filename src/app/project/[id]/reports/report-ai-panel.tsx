"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import type { ReportDraft } from "@/services/aiGovernance";
import { saveAiReportAction, type ActionState } from "../ai/actions";

const initial: ActionState = { ok: false };

type GenerateResponse = {
  ok: true;
  draft: ReportDraft;
};

export function ReportAiPanel({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReportDraft | null>(null);
  const [state, formAction, pending] = useActionState(saveAiReportAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  async function generate() {
    setLoading(true);
    setError(null);

    const res = await postAi<GenerateResponse>("/api/ai/reports/generate", {
      projectId,
      reportType: "status",
    });

    setLoading(false);

    if (!res.ok) {
      setError(aiErrorMessage(res));
      return;
    }

    setDraft(res.data.draft);
  }

  if (state.ok) {
    return (
      <div className="rounded-xl border border-[#0F766E]/20 bg-[#0F766E]/5 p-4">
        <p className="text-sm font-medium text-[#0F766E]">Report saved.</p>
        <button
          type="button"
          onClick={() => {
            setDraft(null);
          }}
          className="mt-2 text-xs text-slate-500 hover:text-slate-700"
        >
          Generate another
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-[#0F766E]/30 bg-[#0F766E]/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={14} className="text-[#0F766E]" />
        <h3 className="text-sm font-semibold text-[#0F766E]">AI status report</h3>
      </div>
      <p className="mb-3 text-xs text-slate-600">
        Generate a draft from live tasks, RAID, and decisions. Review before saving.
      </p>

      {!draft ? (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={generate}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#0F766E] text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Generate status report
              </>
            )}
          </button>
          {error ? (
            <div className="mt-3">
              <AiStatusBanner message={error} />
            </div>
          ) : null}
        </>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="reportType" value="status" />
          <label className="block text-xs font-medium text-slate-700">
            Title
            <input
              name="title"
              defaultValue={draft.title}
              className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Content
            <textarea
              name="content"
              defaultValue={draft.content}
              rows={12}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
            />
          </label>
          {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-[#0F766E] py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : "Approve & save"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-md px-3 py-2 text-sm text-slate-500"
            >
              Discard
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
