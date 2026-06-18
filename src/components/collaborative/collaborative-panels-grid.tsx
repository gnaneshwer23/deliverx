import type { CollaborativeLoopSnapshot } from "@/services/collaborativeLoopEngine";
import { StakeholderLoopPanel } from "./stakeholder-loop-panel";
import { StakeholderPulsePanel } from "./stakeholder-pulse-panel";
import { TeamNeedsPanel } from "./team-needs-panel";

export function CollaborativePanelsGrid({
  snapshot,
  hideStakeholderLoopTitle = false,
}: {
  snapshot: CollaborativeLoopSnapshot;
  hideStakeholderLoopTitle?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <StakeholderLoopPanel rows={snapshot.stakeholderLoop} hideTitle={hideStakeholderLoopTitle} />
      <TeamNeedsPanel needs={snapshot.teamNeeds} />
      <StakeholderPulsePanel items={snapshot.pulse} />
    </div>
  );
}
