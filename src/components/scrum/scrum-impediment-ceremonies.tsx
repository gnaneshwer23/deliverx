"use client";

import Link from "next/link";
import type { ScrumImpediment } from "@/services/scrumEngine";
import { dxClass } from "@/lib/dx-theme";
import { getMissionPersonaAccent } from "@/config/mission-persona-accent";

const scrumAccent = getMissionPersonaAccent("scrum");

export function ScrumImpedimentBoard({
  impediments,
  insight,
}: {
  impediments: ScrumImpediment[];
  insight: string;
}) {
  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="scrum-impediment-board">
      <div className="flex items-center justify-between border-b border-[#E4E4DC] px-6 py-4">
        <div>
          <h3 className={`${dxClass.display} text-lg`}>Impediment board</h3>
          <p className="text-xs text-[#6B6B64]">What&apos;s blocking the team</p>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums"
          style={{ backgroundColor: scrumAccent.bg, color: scrumAccent.text }}
        >
          {impediments.length}
        </span>
      </div>
      <ul className="divide-y divide-[#F0F0E8]">
        {impediments.length ? (
          impediments.map((imp) => (
            <li key={imp.title} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium text-[#0D0D0B]">{imp.title}</p>
                <p className="text-[10px] text-[#A8A89E]">
                  {imp.owner} · {imp.ageDays} day{imp.ageDays === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${
                  imp.severity === "high"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {imp.severity}
              </span>
            </li>
          ))
        ) : (
          <li className="px-6 py-8 text-center text-sm text-[#6B6B64]">
            No impediments logged — team flow is clear.
          </li>
        )}
      </ul>
      {insight ? (
        <p className="border-t border-[#F0F0E8] px-6 py-3 text-xs text-[#6B6B64]">{insight}</p>
      ) : null}
    </div>
  );
}

export function ScrumCeremoniesRow({
  projectId,
  ceremonies,
  standupBlockers,
}: {
  projectId?: string;
  ceremonies: string[];
  standupBlockers: string[];
}) {
  const links = [
    { id: "standup", label: "Daily standup", ceremony: "standup" },
    { id: "planning", label: "Sprint planning", ceremony: "planning" },
    { id: "retro", label: "Retrospective", ceremony: "retro" },
    { id: "review", label: "Sprint review", ceremony: "review" },
  ];

  return (
    <div className={`${dxClass.card} p-6`} data-panel="scrum-ceremonies">
      <h3 className={`${dxClass.display} mb-4 text-lg`}>Ceremonies</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {links.map((c) => {
          const href = projectId ? `/project/${projectId}/meetings?ceremony=${c.ceremony}` : null;
          const scheduled = ceremonies.some((name) =>
            name.toLowerCase().includes(c.ceremony),
          );
          return href ? (
            <Link
              key={c.id}
              href={href}
              className="rounded-lg border px-3 py-2 text-sm transition hover:shadow-sm"
              style={{
                borderColor: scheduled ? scrumAccent.border : "#E4E4DC",
                backgroundColor: scheduled ? scrumAccent.bg : "#FAFAF7",
                color: scrumAccent.text,
              }}
            >
              {c.label}
              {scheduled ? (
                <span className="mt-0.5 block text-[9px] text-[#6B6B64]">Scheduled</span>
              ) : null}
            </Link>
          ) : (
            <div
              key={c.id}
              className="rounded-lg border border-[#E4E4DC] bg-[#FAFAF7] px-3 py-2 text-sm text-[#6B6B64]"
            >
              {c.label}
            </div>
          );
        })}
      </div>
      {standupBlockers.length > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase text-amber-800">Standup blockers</p>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-900">
            {standupBlockers.slice(0, 4).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
