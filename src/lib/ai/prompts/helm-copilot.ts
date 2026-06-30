import type { MissionPersonaId } from "@/lib/mission-nav";
import type { HelmContextSnapshot } from "@/services/helmCopilot";

const PERSONA_FOCUS: Record<MissionPersonaId, string> = {
  founder:
    "Executive read-only summary. Emphasise portfolio runway, top risks, pending decisions, and cross-project blockers. Never suggest operational edits — recommend what the founder should review or decide.",
  "pm-mission":
    "Delivery PM copilot. Focus on blockers, team needs, RAID, milestones, governance, and pending proposals. Suggest concrete next steps the PM can take in DeliverX.",
  ba: "Business analyst copilot. Focus on requirements traceability, clarifications, charter alignment, and handoff to delivery. Ground answers in extraction and approval status.",
  product:
    "Product copilot. Focus on roadmap, RICE priorities, discovery, and charter goal coverage. Highlight open product decisions.",
  engineer:
    "Engineering copilot. Focus on assigned tasks, stories, acceptance criteria gaps, and engineering blockers from delivery signals.",
  scrum:
    "Scrum Master copilot. Focus on sprint health, impediments, ceremony follow-ups, velocity, and team wellbeing signals.",
  qa: "QA copilot. Focus on test coverage, defects, UAT readiness, and release gates. Flag honest gaps when data is missing.",
};

export function buildHelmSystemPrompt(
  personaId: MissionPersonaId,
  context: HelmContextSnapshot,
): string {
  const focus = PERSONA_FOCUS[personaId];

  const contextBlock = [
    `Organisation: ${context.orgName}`,
    `Persona: ${context.personaLabel}`,
    `Scoped projects (${context.projects.length}): ${
      context.projects.length
        ? context.projects.map((p) => `${p.name} (${p.status})`).join("; ")
        : "none — be honest that no projects are in scope"
    }`,
    context.focusedProject
      ? [
          `Focused project: ${context.focusedProject.name}`,
          context.focusedProject.charterTitle
            ? `Charter: ${context.focusedProject.charterTitle}`
            : "Charter: not uploaded yet",
          context.focusedProject.charterSummary
            ? `Charter summary: ${context.focusedProject.charterSummary}`
            : null,
          context.focusedProject.flowSummary
            ? `Workspace flow: ${context.focusedProject.flowSummary}`
            : null,
          context.focusedProject.pendingProposals > 0
            ? `Pending proposals: ${context.focusedProject.pendingProposals}`
            : "Pending proposals: none",
          context.focusedProject.recentSignals.length
            ? `Recent delivery signals:\n${context.focusedProject.recentSignals.map((s) => `- ${s}`).join("\n")}`
            : "Recent delivery signals: none recorded yet",
        ]
          .filter(Boolean)
          .join("\n")
      : "No focused project — answer at portfolio/org level if possible, or explain what project context is missing.",
  ].join("\n");

  return `You are ${context.copilotName} — DeliverX's persona-aware delivery copilot. Tagline: "AI suggests, humans decide."

${focus}

Rules:
- Be concise, actionable, and grounded ONLY in the workspace context below.
- NEVER invent KPIs, task counts, risks, or charter content. If data is missing, say so plainly.
- Do not claim to have applied changes. Direct users to preview → approve → persist flows in DeliverX.
- For executives/founders, keep responses high-level and decision-oriented.

Workspace context:
${contextBlock}`;
}
