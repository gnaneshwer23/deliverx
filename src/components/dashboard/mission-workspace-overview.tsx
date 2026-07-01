import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getMissionPersonaMeta } from "@/config/mission-persona-meta";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { MISSION_PERSONA_ORDER, missionWorkspaceHref } from "@/lib/signal-deeplinks";

export function MissionWorkspaceOverview({
  signalCounts,
  projectId,
}: {
  signalCounts: Partial<Record<MissionPersonaId, number>>;
  projectId?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
      {MISSION_PERSONA_ORDER.map((personaId) => {
        const meta = getMissionPersonaMeta(personaId);
        const Icon = meta.icon;
        const pending = signalCounts[personaId] ?? 0;

        return (
          <Link
            key={personaId}
            href={missionWorkspaceHref(personaId, projectId)}
            className={`${dxClass.card} group flex min-h-[108px] flex-col justify-between p-3 transition hover:shadow-[0_4px_20px_rgba(13,13,11,0.09)]`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#EDF7F7] text-[#1A5C5C]">
                <Icon size={16} />
              </span>
              <ArrowUpRight
                size={14}
                className="text-[#A8A89E] opacity-0 transition group-hover:opacity-100"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-[#2C2C28]">{meta.roleLabel}</p>
              <div className="mt-1.5">
                {pending > 0 ? (
                  <DxBadge tone="amber" dot>
                    {pending} signal{pending === 1 ? "" : "s"}
                  </DxBadge>
                ) : (
                  <DxBadge tone="green">Clear</DxBadge>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
