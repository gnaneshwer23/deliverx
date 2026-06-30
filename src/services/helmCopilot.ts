import { AiConfigError, generateText, isAiConfigured } from "@/lib/ai/anthropic";
import { buildHelmSystemPrompt } from "@/lib/ai/prompts/helm-copilot";
import {
  dbRoleToImpactRole,
  HELM_NAME,
  helmEmptyStateHint,
} from "@/config/helm-copilot";
import { getMissionPersonaMeta } from "@/config/mission-persona-meta";
import { roleToMissionPersona, type MissionPersonaId } from "@/lib/mission-nav";
import { requireAuth } from "@/lib/api/auth";
import { getActiveCharter } from "@/services/charter";
import { listProjectImpactEvents } from "@/services/deliveryImpact";
import type { DeliveryImpactRole } from "@/services/deliveryImpactEngine";
import { listProjectsForCurrentUser } from "@/services/portfolio";
import { listPendingMeetingProposals, listProjectProposals } from "@/services/proposedActions";
import { getWorkspaceFlowSnapshot } from "@/services/workspaceFlowSnapshot";

export type HelmChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type HelmContextSnapshot = {
  copilotName: string;
  orgName: string;
  personaId: MissionPersonaId;
  personaLabel: string;
  impactRole: DeliveryImpactRole;
  projects: Array<{ id: string; name: string; status: string }>;
  focusedProject: {
    id: string;
    name: string;
    charterTitle: string | null;
    charterSummary: string | null;
    flowSummary: string | null;
    pendingProposals: number;
    recentSignals: string[];
  } | null;
  hasLiveData: boolean;
  emptyHint: string;
};

function truncate(text: string | null | undefined, max = 320): string | null {
  if (!text?.trim()) return null;
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

export async function buildHelmContext(input: {
  personaId?: MissionPersonaId | null;
  projectId?: string | null;
}): Promise<HelmContextSnapshot> {
  const { supabase, user } = await requireAuth();

  const { data: profile } = await supabase
    .from("users")
    .select("role, organisations(name)")
    .eq("id", user.id)
    .single();

  const orgName = (profile?.organisations as { name?: string } | null)?.name ?? "your organisation";
  const personaId =
    input.personaId ?? roleToMissionPersona(profile?.role) ?? ("pm-mission" as MissionPersonaId);
  const meta = getMissionPersonaMeta(personaId);
  const impactRole = dbRoleToImpactRole(profile?.role);

  const projectRows = await listProjectsForCurrentUser();
  const projects = projectRows.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status ?? "active",
  }));

  const focusedId =
    input.projectId && projects.some((p) => p.id === input.projectId)
      ? input.projectId
      : projects[0]?.id ?? null;

  let focusedProject: HelmContextSnapshot["focusedProject"] = null;

  if (focusedId) {
    const project = projects.find((p) => p.id === focusedId)!;
    const [charter, flow, impactEvents, meetingPending, allPending] = await Promise.all([
      getActiveCharter(focusedId).catch(() => null),
      getWorkspaceFlowSnapshot(focusedId).catch(() => null),
      listProjectImpactEvents(focusedId, 12).catch(() => []),
      listPendingMeetingProposals(focusedId, 20).catch(() => []),
      listProjectProposals(focusedId, 40).catch(() => []),
    ]);

    const roleSignals = impactEvents
      .filter((e) => e.target_role === impactRole)
      .slice(0, 5)
      .map((e) => e.message);

    const charterSummary =
      truncate(charter?.scope_summary) ??
      truncate(charter?.content, 240) ??
      truncate(flow?.aiSummary);

    focusedProject = {
      id: focusedId,
      name: project.name,
      charterTitle: charter?.title ?? flow?.charterTitle ?? null,
      charterSummary,
      flowSummary: flow?.nothingAppliedYet
        ? "Business case uploaded but no requirements applied yet"
        : flow?.aiSummary
          ? truncate(flow.aiSummary, 200)
          : null,
      pendingProposals:
        allPending.filter((p) => p.status === "pending").length + meetingPending.length,
      recentSignals: roleSignals,
    };
  }

  const hasLiveData =
    projects.length > 0 &&
    Boolean(
      focusedProject?.charterSummary ||
        focusedProject?.recentSignals.length ||
        (focusedProject?.pendingProposals ?? 0) > 0,
    );

  return {
    copilotName: HELM_NAME,
    orgName,
    personaId,
    personaLabel: meta.roleLabel,
    impactRole,
    projects,
    focusedProject,
    hasLiveData,
    emptyHint: helmEmptyStateHint(personaId),
  };
}

export async function runHelmChat(input: {
  messages: HelmChatMessage[];
  personaId?: MissionPersonaId | null;
  projectId?: string | null;
}): Promise<string> {
  if (!isAiConfigured()) {
    throw new AiConfigError();
  }

  const context = await buildHelmContext({
    personaId: input.personaId,
    projectId: input.projectId,
  });

  const history = input.messages
    .slice(-8)
    .map((m) => `${m.role === "user" ? "User" : "Helm"}: ${m.content}`)
    .join("\n\n");

  const system = buildHelmSystemPrompt(context.personaId, context);
  const prompt = history
    ? `${history}\n\nRespond to the latest user message.`
    : input.messages[input.messages.length - 1]?.content ?? "";

  return generateText({ system, prompt, maxTokens: 2048 });
}
