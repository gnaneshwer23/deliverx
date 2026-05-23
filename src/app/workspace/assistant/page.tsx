import { AiWorkspace } from "@/components/dx/ai-workspace";
import { listProjectsForOrg } from "@/services/portfolio";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const projects = await listProjectsForOrg();

  return <AiWorkspace projects={projects.map((p) => ({ id: p.id, name: p.name }))} />;
}
