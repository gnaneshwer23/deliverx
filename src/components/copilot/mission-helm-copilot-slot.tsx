import type { MissionPersonaId } from "@/lib/mission-nav";
import { HelmCopilotSection } from "@/components/copilot/helm-copilot-section";

/** Compact Helm embed for persona mission-control pages. */
export async function MissionHelmCopilotSlot({
  personaId,
  projectId,
}: {
  personaId: MissionPersonaId;
  projectId?: string | null;
}) {
  return (
    <HelmCopilotSection personaId={personaId} projectId={projectId} embedded />
  );
}
