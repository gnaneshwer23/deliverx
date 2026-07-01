import { describe, expect, it } from "vitest";
import {
  IMPACT_ROLE_TO_PERSONA,
  buildAlertDeepLinks,
  buildImpactEventHref,
  countImpactSignalsByPersona,
  impactEventActionLabel,
  impactRoleToMissionPersona,
  missionWorkspaceHref,
  proposalsReviewHref,
} from "@/lib/signal-deeplinks";
import type { DeliveryAlert } from "@/services/alerts";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";

function impactEvent(
  patch: Partial<DeliveryImpactEventRow> & Pick<DeliveryImpactEventRow, "message" | "target_role">,
): DeliveryImpactEventRow {
  return {
    id: patch.id ?? "evt-1",
    organisation_id: "org-1",
    project_id: patch.project_id ?? "proj-1",
    source: "artifact",
    source_id: null,
    proposal_id: null,
    action_type: patch.action_type ?? "task_status_change",
    entity_type: "task",
    entity_id: null,
    tone: patch.tone ?? "waiting",
    created_at: patch.created_at ?? new Date().toISOString(),
    ...patch,
  };
}

function alert(patch: Partial<DeliveryAlert> & Pick<DeliveryAlert, "id" | "category" | "title">): DeliveryAlert {
  return {
    severity: "medium",
    description: "Test alert",
    ...patch,
  };
}

describe("signal-deeplinks", () => {
  it("maps impact roles to mission persona ids", () => {
    expect(impactRoleToMissionPersona("pm")).toBe("pm-mission");
    expect(impactRoleToMissionPersona("scrum")).toBe("scrum");
    expect(IMPACT_ROLE_TO_PERSONA.engineer).toBe("engineer");
  });

  it("builds mission workspace and proposals URLs", () => {
    expect(missionWorkspaceHref("scrum", "proj-9")).toBe("/workspace/scrum-mission?project=proj-9");
    expect(proposalsReviewHref("ba", "proj-9")).toBe("/workspace/proposals?persona=ba&project=proj-9");
  });

  it("routes AI review queue signals to proposals", () => {
    const event = impactEvent({
      message: "Sprint retro processed — 3 proposal(s) in AI Review Queue",
      target_role: "pm",
      action_type: "meeting_intel_queued",
    });

    expect(buildImpactEventHref(event)).toBe("/workspace/proposals?persona=pm-mission&project=proj-1");
    expect(impactEventActionLabel(event)).toBe("Review");
  });

  it("routes BA join signals to BA mission control", () => {
    const event = impactEvent({
      message: "Alex joined Acme Portal as BA",
      target_role: "pm",
    });

    expect(buildImpactEventHref(event)).toBe("/workspace/ba?project=proj-1");
    expect(impactEventActionLabel(event)).toBe("Open mission control");
  });

  it("routes BA invite signals to pm-mission anchor", () => {
    const event = impactEvent({
      message: "BA invite link ready — share to onboard requirements lead",
      target_role: "pm",
    });

    expect(buildImpactEventHref(event)).toBe("/workspace/pm-mission?project=proj-1#pm-role-invites");
  });

  it("defaults engineer-targeted events to engineer mission control", () => {
    const event = impactEvent({
      message: "Task blocked: OAuth token refresh",
      target_role: "engineer",
      tone: "blocked",
    });

    expect(buildImpactEventHref(event)).toBe("/workspace/engineer?project=proj-1");
  });

  it("builds alert queue mission and review deep-links", () => {
    const proposalAlert = alert({
      id: "prop-1",
      category: "proposal",
      title: "Create RAID from meeting",
      projectId: "proj-2",
    });

    expect(buildAlertDeepLinks(proposalAlert)).toEqual({
      missionHref: "/workspace/pm-mission?project=proj-2",
      reviewHref: "/workspace/proposals?persona=pm-mission&project=proj-2",
      missionLabel: "Open mission control",
      reviewLabel: "Review",
    });

    const blockerAlert = alert({
      id: "block-1",
      category: "blocker",
      title: "Auth API dependency",
      projectId: "proj-2",
    });

    expect(buildAlertDeepLinks(blockerAlert)).toEqual({
      missionHref: "/workspace/engineer?project=proj-2",
      missionLabel: "Open mission control",
    });
  });

  it("counts impact signals per persona for workspace overview", () => {
    const counts = countImpactSignalsByPersona([
      impactEvent({ message: "Task blocked", target_role: "engineer" }),
      impactEvent({ id: "evt-2", message: "Sprint risk", target_role: "scrum" }),
      impactEvent({ id: "evt-3", message: "Release risk", target_role: "pm" }),
      impactEvent({ id: "evt-4", message: "Release risk duplicate", target_role: "pm" }),
    ]);

    expect(counts.engineer).toBe(1);
    expect(counts.scrum).toBe(1);
    expect(counts["pm-mission"]).toBe(2);
  });
});
