import { SovereignPageHeader } from "@/components/sovereign/sovereign-page-header";
import { AssistantChat } from "@/components/sovereign/assistant-chat";
import { listProjectsForOrg } from "@/services/portfolio";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const projects = await listProjectsForOrg();

  return (
    <main className="p-6 lg:p-8">
      <SovereignPageHeader
        eyebrow="AI · Guardrailed"
        title="Delivery assistant"
        description="Chat with your delivery copilot. Grounded in charter, governance, and live workspace signals — preview and approve before anything persists."
      />
      <AssistantChat projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
    </main>
  );
}
