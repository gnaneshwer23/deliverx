"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { AiStatusBanner } from "@/components/ai/ai-status-banner";
import { aiErrorMessage, postAi } from "@/lib/ai/client-fetch";
import type { RaidSuggestion } from "@/services/aiGovernance";
import { applyRaidSuggestionsAction, type ActionState } from "../ai/actions";

const initial: ActionState = { ok: false };

type SuggestResponse = {
  ok: true;
  items: RaidSuggestion[];
};

export function RaidAiPanel({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<RaidSuggestion[] | null>(null);
  const [state, formAction, pending] = useActionState(applyRaidSuggestionsAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  async function suggest() {
    const trimmed = context.trim();
    if (!trimmed) {
      setError("Describe recent changes or concerns to suggest RAID items.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await postAi<SuggestResponse>("/api/ai/raid/suggest", {
      projectId,
      context: trimmed,
    });

    setLoading(false);

    if (!res.ok) {
      setError(aiErrorMessage(res));
      return;
    }

    setItems(res.data.items ?? []);
  }

  if (state.ok) {
    return (
      <div className="rounded-xl border border-[#0F766E]/20 bg-[#0F766E]/5 p-4">
        <p className="text-sm font-medium text-[#0F766E]">RAID suggestions applied.</p>
        <button
          type="button"
          onClick={() => {
            setItems(null);
            setContext("");
          }}
          className="mt-2 text-xs text-slate-500 hover:text-slate-700"
        >
          Suggest more
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-[#0F766E]/30 bg-[#0F766E]/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={14} className="text-[#0F766E]" />
        <h3 className="text-sm font-semibold text-[#0F766E]">AI RAID suggest</h3>
      </div>
      <p className="mb-3 text-xs text-slate-600">
        Suggest risks and dependencies for {projectName}. Review before adding to the log.
      </p>

      {!items ? (
        <>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={4}
            placeholder="e.g. Vendor delay on integration, new regulatory requirement, key SME leaving…"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={loading}
            onClick={suggest}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#0F766E]/30 bg-white text-sm font-medium text-[#0F766E] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Suggesting…
              </>
            ) : (
              <>
                <Sparkles size={14} /> Suggest RAID items
              </>
            )}
          </button>
          {error ? (
            <div className="mt-3">
              <AiStatusBanner message={error} />
            </div>
          ) : null}
        </>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500">No new items suggested. Try more context.</p>
      ) : (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="items" value={JSON.stringify(items)} />
          <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
            {items.map((item, i) => (
              <li key={i} className="rounded-lg border border-slate-200 bg-white p-2">
                <p className="font-medium capitalize text-slate-800">
                  [{item.type}] {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                {item.mitigation ? (
                  <p className="mt-1 text-xs text-slate-500">Mitigation: {item.mitigation}</p>
                ) : null}
              </li>
            ))}
          </ul>
          {state.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-md bg-[#0F766E] py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Adding…" : `Approve & add ${items.length} item(s)`}
            </button>
            <button
              type="button"
              onClick={() => setItems(null)}
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
