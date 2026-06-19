import { getOrgRecentBootstrapProject, projectHasBootstrapParity } from "@/services/orgBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { BootstrapParityBanner } from "@/components/dx/bootstrap-parity-banner";
import { LiveDataPromptBanner } from "@/components/dx/live-data-prompt-banner";
import {
  buildLiveDataPromptConfig,
  type LiveDataPromptPersonaId,
} from "@/lib/live-data-prompt-ctas";

export async function MissionBootstrapBanner({
  personaId,
  projectId,
  showFallback,
}: {
  personaId: LiveDataPromptPersonaId;
  projectId?: string;
  showFallback: boolean;
}) {
  if (!showFallback) return null;

  const bootstrap = await getOrgRecentBootstrapProject(projectId).catch(() => null);
  if (projectHasBootstrapParity(bootstrap)) {
    return (
      <BootstrapParityBanner summary={bootstrap.bootstrap_summary as ProjectBootstrapSummary} />
    );
  }

  return <LiveDataPromptBanner {...buildLiveDataPromptConfig(personaId, projectId)} />;
}
