import { describe, expect, it } from "vitest";
import {
  AUDIT_EVENT_LABELS,
  formatAuditTimeline,
  formatAuditTimelineItem,
} from "./audit-timeline";
import type { AuditEventRow } from "@/services/auditEvents";

function event(overrides: Partial<AuditEventRow> = {}): AuditEventRow {
  return {
    id: "evt-1",
    organisation_id: "org-1",
    project_id: "proj-1",
    actor_id: "user-1",
    event_type: "human_approved",
    entity_type: "requirement",
    entity_id: "req-1",
    artifact_review_id: "rev-1",
    proposal_id: null,
    metadata: { title: "Login requirement" },
    created_at: "2026-06-18T10:00:00Z",
    ...overrides,
  };
}

describe("audit-timeline", () => {
  it("labels audit event types for display", () => {
    expect(AUDIT_EVENT_LABELS.human_approved).toBe("Approved");
    expect(AUDIT_EVENT_LABELS.ai_suggested).toBe("AI suggested");
  });

  it("formats a single audit timeline item with actor and project", () => {
    const item = formatAuditTimelineItem({
      ...event(),
      actor_name: "Alex PM",
      actor_email: "alex@example.com",
      project_name: "DeliverX Core",
    });

    expect(item.eventLabel).toBe("Approved");
    expect(item.entityLabel).toBe("Requirement");
    expect(item.title).toBe("Login requirement");
    expect(item.actorLabel).toBe("Alex PM");
    expect(item.projectLabel).toBe("DeliverX Core");
    expect(item.severity).toBe("low");
  });

  it("falls back to actor email and entity id when metadata is sparse", () => {
    const item = formatAuditTimelineItem({
      ...event({
        metadata: {},
        actor_id: "user-abc",
        entity_id: "entity-xyz",
        artifact_review_id: null,
        event_type: "human_rejected",
      }),
      actor_name: null,
      actor_email: "reviewer@example.com",
      project_name: null,
    });

    expect(item.title).toContain("entity-x");
    expect(item.actorLabel).toBe("reviewer@example.com");
    expect(item.severity).toBe("high");
  });

  it("formats a timeline list preserving order", () => {
    const items = formatAuditTimeline([
      { ...event({ id: "a", event_type: "ai_suggested" }), project_name: "Alpha" },
      { ...event({ id: "b", event_type: "applied" }), project_name: "Beta" },
    ]);

    expect(items).toHaveLength(2);
    expect(items[0]?.eventLabel).toBe("AI suggested");
    expect(items[1]?.eventLabel).toBe("Applied");
  });
});
