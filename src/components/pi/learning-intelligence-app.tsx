"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import Link from "next/link";
import {
  LEARNING_ITEM_KINDS,
  PI_LEARNING_PATH,
  type LearningEvidenceLevel,
  type LearningItemKind,
  type LearningItemRecord,
  type LearningPathRecord,
  type LearningRecommendation,
} from "@/lib/learning-intelligence/types";
import { PI_EVIDENCE_PATH, PI_PROFILE_PATH } from "@/lib/pi-profile/paths";

type LearningPayload = {
  items: LearningItemRecord[];
  paths: LearningPathRecord[];
  recommendations: LearningRecommendation[];
  summary: {
    itemCount: number;
    highestLevel: LearningEvidenceLevel | null;
    reflectedUponOrHigher: boolean;
  };
  gaps: string[];
  targetRole: string | null;
  experienceHref: string;
  notice: string;
};

const LEVEL_LABELS: Record<LearningEvidenceLevel, string> = {
  consumed: "Consumed",
  understood: "Understood",
  reflected_upon: "Reflected upon",
  applied: "Applied",
  repeatedly_applied: "Repeatedly applied",
  outcome_supported: "Outcome-supported",
};

export function LearningIntelligenceApp() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [data, setData] = useState<LearningPayload | null>(null);

  const [kind, setKind] = useState<LearningItemKind>("article");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const [concepts, setConcepts] = useState("");
  const [reflection, setReflection] = useState("");
  const [relevanceToRole, setRelevanceToRole] = useState("");
  const [relevanceToGaps, setRelevanceToGaps] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/learning");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load learning");
      setData(json as LearningPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/pi/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title,
          topic,
          source,
          concepts: concepts
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
          reflection,
          relevanceToRole,
          relevanceToGaps: relevanceToGaps
            .split("\n")
            .map((g) => g.trim())
            .filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      setNotice(json.notice ?? "Saved as knowledge evidence — not capability.");
      setTitle("");
      setTopic("");
      setSource("");
      setConcepts("");
      setReflection("");
      setRelevanceToRole("");
      setRelevanceToGaps("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function advanceItem(id: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/pi/learning/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advance: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not advance");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Advance failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-[#6B6B64]">
        Loading Learning Intelligence…
      </div>
    );
  }

  const experienceHref = data?.experienceHref ?? "/experience/app";
  const applyReady = data?.summary.reflectedUponOrHigher ?? false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#6B6B64]">
        Learning Intelligence
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-dx-display)] text-3xl tracking-tight text-[#1A1A18]">
        Close gaps with knowledge — then prove them in practice
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#4A4A45]">
        Log books, articles, courses, podcasts and certifications with reflection.
        Completing learning never assigns capability or lights Verified. Capability
        moves only when assessment interprets practice evidence from Experience or
        Workspace.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link href={PI_PROFILE_PATH} className="rounded-md border border-[#D6D3C8] bg-white px-3 py-1.5 text-[#1A1A18]">
          Profile
        </Link>
        <Link href={PI_EVIDENCE_PATH} className="rounded-md border border-[#D6D3C8] bg-white px-3 py-1.5 text-[#1A1A18]">
          Evidence Ledger
        </Link>
        <Link
          href={experienceHref}
          className="rounded-md bg-[#1C4A2E] px-3 py-1.5 font-medium text-white"
        >
          {applyReady ? "Apply in Experience" : "Open Experience"}
        </Link>
      </div>

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-md border border-[#CDE5D4] bg-[#F0F7F2] px-3 py-2 text-sm text-[#1C4A2E]">
          {notice}
        </p>
      ) : null}

      {data?.gaps?.length ? (
        <section className="mt-10">
          <h2 className="text-sm font-medium text-[#1A1A18]">Gap-driven paths</h2>
          <p className="mt-1 text-xs text-[#6B6B64]">
            From your latest assessment. Each path ends with an application trigger —
            learning alone never upgrades levels.
          </p>
          <ul className="mt-4 space-y-3">
            {(data.recommendations.length ? data.recommendations : []).map((r) => (
              <li
                key={r.targetGap}
                className="rounded-lg border border-[#E5E2D9] bg-white px-4 py-3"
              >
                <p className="text-sm font-medium text-[#1A1A18]">{r.pathTitle}</p>
                <p className="mt-1 text-xs text-[#4A4A45]">{r.rationale}</p>
                <p className="mt-2 text-[11px] text-[#6B6B64]">
                  Concepts: {r.concepts.join(" · ")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-[#D6D3C8] bg-[#FAFAF7] px-3 py-1.5 text-[11px] font-medium text-[#1A1A18]"
                    onClick={() => {
                      setTopic(r.pathTitle.replace(/^Close gap:\s*/i, ""));
                      setConcepts(r.concepts.join(", "));
                      setRelevanceToGaps(r.targetGap);
                      setRelevanceToRole(data.targetRole ?? "");
                      setKind(r.suggestedKinds[0] ?? "article");
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                    }}
                  >
                    Start logging
                  </button>
                  <Link
                    href={r.applicationTrigger.href}
                    className="rounded-md bg-[#1C4A2E] px-3 py-1.5 text-[11px] font-medium text-white"
                  >
                    {r.applicationTrigger.title}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="mt-10 rounded-lg border border-dashed border-[#D6D3C8] bg-[#FAFAF7] px-4 py-5">
          <p className="text-sm text-[#4A4A45]">
            No assessment gaps yet. Run a capability assessment on practice evidence, or log learning
            below and apply it in Experience afterward.
          </p>
          <Link
            href={`${PI_EVIDENCE_PATH}?run=1`}
            className="mt-3 inline-block text-xs font-medium text-[#1C4A2E] underline"
          >
            Open Evidence & capability
          </Link>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-medium text-[#1A1A18]">Your learning record</h2>
        <p className="mt-1 text-xs text-[#6B6B64]">
          Levels: consumed → understood → reflected_upon → applied → repeatedly_applied →
          outcome_supported. Private to you (RLS self-only).
        </p>
        {data?.items?.length ? (
          <ul className="mt-4 space-y-3">
            {data.items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-[#E5E2D9] bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-[#1A1A18]">
                    <span className="mr-2 text-[10px] uppercase tracking-wide text-[#6B6B64]">
                      {item.kind}
                    </span>
                    {item.title}
                  </p>
                  <span className="rounded-full border border-[#D6D3C8] px-2 py-0.5 text-[10px] text-[#4A4A45]">
                    {LEVEL_LABELS[item.evidenceLevel]}
                  </span>
                </div>
                {item.topic ? (
                  <p className="mt-1 text-xs text-[#4A4A45]">{item.topic}</p>
                ) : null}
                {item.reflection ? (
                  <p className="mt-2 text-xs italic text-[#6B6B64]">
                    “{item.reflection.slice(0, 180)}
                    {item.reflection.length > 180 ? "…" : ""}”
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={saving || item.evidenceLevel === "outcome_supported"}
                    onClick={() => void advanceItem(item.id)}
                    className="rounded-md border border-[#D6D3C8] px-2.5 py-1 text-[11px] text-[#1A1A18] disabled:opacity-50"
                  >
                    Advance level
                  </button>
                  {item.evidenceLevel === "reflected_upon" ||
                  item.evidenceLevel === "understood" ||
                  item.evidenceLevel === "consumed" ? (
                    <Link
                      href={item.applicationHref ?? experienceHref}
                      className="rounded-md bg-[#1C4A2E] px-2.5 py-1 text-[11px] font-medium text-white"
                    >
                      Apply in Experience
                    </Link>
                  ) : (
                    <Link
                      href={experienceHref}
                      className="rounded-md border border-[#D6D3C8] px-2.5 py-1 text-[11px] text-[#1A1A18]"
                    >
                      Continue practice
                    </Link>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-[#6B6B64]">
                  knowledge evidence
                  {item.evidenceId ? ` · ${item.evidenceId.slice(0, 8)}…` : ""} · not
                  capability
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#6B6B64]">No learning logged yet.</p>
        )}
      </section>

      <section className="mt-10 border-t border-[#E5E2D9] pt-8">
        <h2 className="text-sm font-medium text-[#1A1A18]">Log learning</h2>
        <form onSubmit={onCreate} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-[#4A4A45]">
              Kind
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as LearningItemKind)}
                className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm"
              >
                {LEARNING_ITEM_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs text-[#4A4A45]">
              Consumed / published source
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="URL, publisher, or author"
                className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs text-[#4A4A45]">
            Title
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book, course, article, podcast, or cert name"
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[#4A4A45]">
            Topic
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Delivery under constraint"
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[#4A4A45]">
            Concepts (comma-separated)
            <input
              value={concepts}
              onChange={(e) => setConcepts(e.target.value)}
              placeholder="cut scope before quality, capacity-based commitments"
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[#4A4A45]">
            Reflection
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="What changed in how you will decide or communicate?"
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[#4A4A45]">
            Relevance to target role
            <input
              value={relevanceToRole}
              onChange={(e) => setRelevanceToRole(e.target.value)}
              placeholder={data?.targetRole ?? "How this helps your target role"}
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs text-[#4A4A45]">
            Relevance to gaps (one per line)
            <textarea
              value={relevanceToGaps}
              onChange={(e) => setRelevanceToGaps(e.target.value)}
              rows={2}
              placeholder="Paste a capability gap this addresses"
              className="mt-1 w-full rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="rounded-md bg-[#1C4A2E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save learning (knowledge evidence)"}
          </button>
          <p className="text-[10px] text-[#6B6B64]">
            Appends ledger evidence with source_type learning_activity · category knowledge ·
            learningNotCapability. No capability assessment is triggered.
          </p>
        </form>
      </section>

      <p className="mt-10 text-[10px] text-[#A8A89E]">
        Surface {PI_LEARNING_PATH} · Learning Intelligence v1 · not an LMS
      </p>
    </div>
  );
}
