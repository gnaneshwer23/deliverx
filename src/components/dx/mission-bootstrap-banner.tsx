import { getOrgRecentBootstrapProject, projectHasBootstrapParity } from "@/services/orgBootstrap";
import type { ProjectBootstrapSummary } from "@/services/projectBootstrap";
import { BootstrapParityBanner } from "@/components/dx/bootstrap-parity-banner";
import { MockDataBanner } from "@/components/dx/mock-data-banner";

export async function MissionBootstrapBanner({
  projectId,
  showFallback,
  fallbackMessage,
  uploadHref,
}: {
  projectId?: string;
  showFallback: boolean;
  fallbackMessage: string;
  uploadHref?: string;
}) {
  if (!showFallback) return null;

  const bootstrap = await getOrgRecentBootstrapProject(projectId).catch(() => null);
  if (projectHasBootstrapParity(bootstrap)) {
    return (
      <BootstrapParityBanner summary={bootstrap.bootstrap_summary as ProjectBootstrapSummary} />
    );
  }

  return <MockDataBanner message={fallbackMessage} uploadHref={uploadHref} />;
}
