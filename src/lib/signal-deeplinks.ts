/**
 * F4 — Map delivery impact events and alerts to persona mission routes.
 */

import { getMissionPersonaMeta } from "@/config/mission-persona-meta";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { MISSION_CONTROL_IDS } from "@/lib/mission-nav";
import type { DeliveryAlert } from "@/services/alerts";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";
import type { DeliveryImpactRole } from "@/services/deliveryImpactEngine";

export const IMPACT_ROLE_TO_PERSONA: Record<DeliveryImpactRole, MissionPersonaId> = {
  founder: "founder",
  product: "product",
  pm: "pm-mission",
  ba: "ba",
  engineer: "engineer",
  qa: "qa",
  scrum: "scrum",
};

export const MISSION_PERSONA_ORDER: MissionPersonaId[] = [
  "founder",
  "pm-mission",
  "ba",
  "product",
  "engineer",
  "scrum",
  "qa",
];

export function impactRoleToMissionPersona(role: DeliveryImpactRole): MissionPersonaId {
  return IMPACT_ROLE_TO_PERSONA[role];
}

export function missionWorkspaceHref(personaId: MissionPersonaId, projectId?: string): string {
  const base = getMissionPersonaMeta(personaId).routeBase;
  if (!projectId) return base;
  return `${base}?project=${encodeURIComponent(projectId)}`;
}

export function proposalsReviewHref(personaId: MissionPersonaId, projectId?: string): string {
  const projectQs = projectId ? `&project=${encodeURIComponent(projectId)}` : "";
  return `/workspace/proposals?persona=${personaId}${projectQs}`;
}

function messageNeedsProposalsReview(message: string, actionType: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg.includes("ai review queue") ||
    msg.includes("business case uploaded") ||
    msg.includes("proposal") ||
    msg.includes("pending pm approval") ||
    actionType.includes("proposal") ||
    actionType === "artifact_review"
  );
}

/** Resolve a persisted impact event to the best persona / proposals deep-link. */
export function buildImpactEventHref(event: DeliveryImpactEventRow): string {
  const personaId = impactRoleToMissionPersona(event.target_role);
  const projectId = event.project_id;
  const msg = event.message.toLowerCase();

  if (msg.includes("ba invite") || msg.includes("join link") || msg.includes("role invite")) {
    return projectId
      ? `/workspace/pm-mission?project=${encodeURIComponent(projectId)}#pm-role-invites`
      : "/workspace/pm-mission#pm-role-invites";
  }

  if (msg.includes(" joined ") && msg.includes(" as ba")) {
    return missionWorkspaceHref("ba", projectId);
  }

  if (msg.includes("workspace created") || msg.includes("business case approved")) {
    return missionWorkspaceHref("pm-mission", projectId);
  }

  if (messageNeedsProposalsReview(event.message, event.action_type)) {
    return proposalsReviewHref(
      event.target_role === "pm" ? "pm-mission" : personaId,
      projectId,
    );
  }

  if (event.action_type.includes("meeting") && (msg.includes("review") || msg.includes("queue"))) {
    return proposalsReviewHref("pm-mission", projectId);
  }

  return missionWorkspaceHref(personaId, projectId);
}

export function impactEventActionLabel(event: DeliveryImpactEventRow): string {
  if (messageNeedsProposalsReview(event.message, event.action_type)) {
    return "Review";
  }
  return "Open mission control";
}

export type AlertDeepLink = {
  missionHref: string;
  reviewHref?: string;
  missionLabel: string;
  reviewLabel?: string;
};

function alertCategoryToPersona(category: DeliveryAlert["category"]): MissionPersonaId {
  switch (category) {
    case "blocker":
      return "engineer";
    case "decision":
      return "founder";
    case "standup":
      return "scrum";
    case "artifact":
    case "proposal":
    case "approval":
      return "pm-mission";
    default:
      return "pm-mission";
  }
}

/** Command Centre alert queue actions — mission workspace + optional proposals review. */
export function buildAlertDeepLinks(alert: DeliveryAlert): AlertDeepLink {
  const personaId = alertCategoryToPersona(alert.category);
  const missionHref = missionWorkspaceHref(personaId, alert.projectId);

  const needsReview =
    alert.category === "artifact" ||
    alert.category === "proposal" ||
    alert.category === "approval";

  return {
    missionHref,
    reviewHref: needsReview ? proposalsReviewHref(personaId, alert.projectId) : undefined,
    missionLabel: "Open mission control",
    reviewLabel: needsReview ? "Review" : undefined,
  };
}

export function countImpactSignalsByPersona(
  events: DeliveryImpactEventRow[],
): Partial<Record<MissionPersonaId, number>> {
  const counts: Partial<Record<MissionPersonaId, number>> = {};

  for (const event of events) {
    const personaId = impactRoleToMissionPersona(event.target_role);
    if (!MISSION_CONTROL_IDS.has(personaId)) continue;
    counts[personaId] = (counts[personaId] ?? 0) + 1;
  }

  return counts;
}
