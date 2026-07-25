import { AiWorkspace } from "@/components/dx/ai-workspace";
import { listProjectsForOrg } from "@/services/portfolio";

export const dynamic = "force-dynamic";

/** Legacy AI Workspace surface — Coach module is the Professional Workspace entry. */
export default async function AssistantPage() {
  const projects = await listProjectsForOrg();

  return <AiWorkspace projects={projects.map((p) => ({ id: p.id, name: p.name }))} />;
}
