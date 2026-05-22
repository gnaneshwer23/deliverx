import { generateText } from "@/lib/ai/anthropic";
import { requireAuth } from "@/lib/api/auth";
import { aiRouteError } from "@/lib/api/ai-route";
import { getOrgDeliveryStats } from "@/services/delivery";
import { getOrgGovernanceStats } from "@/services/governance";
import { listProjectsForOrg } from "@/services/portfolio";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function runAssistantChat(
  messages: ChatMessage[],
  projectId?: string | null,
): Promise<string> {
  const { supabase, user } = await requireAuth();

  const { data: profile } = await supabase
    .from("users")
    .select("role, organisations(name)")
    .single();

  const orgName = (profile?.organisations as { name?: string } | null)?.name ?? "your organisation";
  const role = profile?.role ?? "pm";

  const [projects, delivery, governance] = await Promise.all([
    listProjectsForOrg(),
    getOrgDeliveryStats(),
    getOrgGovernanceStats(),
  ]);

  let projectContext = "";
  if (projectId) {
    const { data: project } = await supabase
      .from("projects")
      .select("name, status, goal, delivery_type")
      .eq("id", projectId)
      .single();
    if (project) {
      projectContext = `\nFocused project: ${project.name} (${project.status}). Goal: ${project.goal ?? "not set"}. Type: ${project.delivery_type ?? "—"}.`;
    }
  }

  const context = [
    `Organisation: ${orgName}`,
    `User role: ${role}`,
    `Active projects: ${projects.filter((p) => p.status === "active").length}`,
    `Tasks in progress: ${delivery.tasksInProgress}`,
    `Team members: ${delivery.teamMembers}`,
    `Open risks: ${governance.openRisks}`,
    `Pending decisions: ${governance.pendingDecisions}`,
    projectContext,
  ].join("\n");

  const history = messages
    .slice(-8)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const system = `You are DeliverX Assistant — a delivery intelligence copilot for programme and project managers.
You help with governance, RAID, charter alignment, standups, reporting, and delivery planning.
Be concise, actionable, and grounded in the user's workspace context. Never invent project data.
If asked to change records, explain what the user should do in the app (preview → approve → persist).
Workspace context:\n${context}`;

  const prompt = history
    ? `${history}\n\nRespond to the latest user message.`
    : messages[messages.length - 1]?.content ?? "";

  return generateText({ system, prompt, maxTokens: 2048 });
}
