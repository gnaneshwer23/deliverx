"use client";

import { Compass, X } from "lucide-react";
import { HelmCopilotPanel } from "@/components/copilot/helm-copilot-panel";
import { DxCaps } from "@/components/dx/dx-logo";
import { useAiDrawer } from "@/components/dx/ai-drawer-context";
import { roleToMissionPersona, type MissionPersonaId } from "@/lib/mission-nav";
import { HELM_NAME } from "@/config/helm-copilot";

export function AiDrawer({
  projects,
  userRole,
}: {
  projects: Array<{ id: string; name: string }>;
  userRole?: string | null;
}) {
  const { open, closeDrawer } = useAiDrawer();
  const personaId = roleToMissionPersona(userRole) ?? ("pm-mission" as MissionPersonaId);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label={`Close ${HELM_NAME}`}
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[2px]"
        onClick={closeDrawer}
      />
      <aside
        id="drawer"
        className="fixed bottom-0 right-0 top-[var(--dx-navh)] z-[70] flex w-full max-w-md flex-col border-l border-[#E4E4DC] bg-white shadow-2xl"
        aria-label={`${HELM_NAME} copilot drawer`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E4E4DC] px-4 py-3">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-[#1C4A2E]" />
            <DxCaps className="text-[9px]">Ask {HELM_NAME}</DxCaps>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex size-8 items-center justify-center text-[#6B6B64] hover:bg-[#F7F7F2] hover:text-[#0D0D0B]"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <HelmCopilotPanel
            personaId={personaId}
            projects={projects}
            compact
            showContextBar
          />
        </div>
      </aside>
    </>
  );
}
