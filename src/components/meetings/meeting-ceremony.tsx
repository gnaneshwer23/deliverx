"use client";

import { MEETING_CEREMONY_TEMPLATES } from "@/lib/ai/prompts/meeting-ceremonies";
import type { MeetingCeremonyType } from "@/lib/ai/prompts/meeting-ceremonies";

const CEREMONY_LABEL: Record<MeetingCeremonyType, string> = {
  general: "General",
  standup: "Standup",
  planning: "Planning",
  retro: "Retro",
  steering: "Steering",
  workshop: "Workshop",
};

const CEREMONY_TONE: Record<MeetingCeremonyType, string> = {
  general: "bg-slate-100 text-slate-700",
  standup: "bg-sky-50 text-sky-800",
  planning: "bg-violet-50 text-violet-800",
  retro: "bg-amber-50 text-amber-800",
  steering: "bg-rose-50 text-rose-800",
  workshop: "bg-emerald-50 text-emerald-800",
};

export function MeetingCeremonyBadge({ type }: { type: MeetingCeremonyType }) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${CEREMONY_TONE[type]}`}
    >
      {CEREMONY_LABEL[type]}
    </span>
  );
}

export function MeetingCeremonySelect({
  name = "ceremonyType",
  defaultValue = "general",
}: {
  name?: string;
  defaultValue?: MeetingCeremonyType;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">Ceremony type</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2 h-10"
      >
        {MEETING_CEREMONY_TEMPLATES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label} — {t.description.slice(0, 60)}…
          </option>
        ))}
      </select>
    </label>
  );
}
