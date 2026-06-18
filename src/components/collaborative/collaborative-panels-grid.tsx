import type { CollaborativeLoopSnapshot } from "@/services/collaborativeLoopEngine";
import { StakeholderLoopPanel } from "./stakeholder-loop-panel";
import { StakeholderPulsePanel } from "./stakeholder-pulse-panel";
import { TeamNeedsPanel } from "./team-needs-panel";

export function CollaborativePanelsGrid({ snapshot }: { snapshot: CollaborativeLoopSnapshot }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <StakeholderLoopPanel rows={snapshot.stakeholderLoop} />
      <TeamNeedsPanel needs={snapshot.teamNeeds} />
      <StakeholderPulsePanel items={snapshot.pulse} />
    </div>
  );
}
