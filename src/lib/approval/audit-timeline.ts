import {
  ARTIFACT_ENTITY_LABELS,
  type ArtifactEntityType,
  type AuditEventType,
} from "@/lib/approval/constants";
import type { AuditEventRow } from "@/services/auditEvents";
import type { FeedCardSeverity } from "@/components/dx/feed-card";

export const AUDIT_EVENT_LABELS: Record<AuditEventType, string> = {
  ai_suggested: "AI suggested",
  human_approved: "Approved",
  human_rejected: "Rejected",
  applied: "Applied",
  updated: "Updated",
};

export const AUDIT_EVENT_BADGE_CLASS: Record<AuditEventType, string> = {
  ai_suggested: "text-[#6B6B64] bg-[#F7F7F2]",
  human_approved: "text-[#1A6B3A] bg-[#EDF7F1]",
  human_rejected: "text-[#C0392B] bg-[#FDEEEE]",
  applied: "text-[#1C4A2E] bg-[#EEF5F1]",
  updated: "text-[#6B6B64] bg-[#F7F7F2]",
};

export type AuditTimelineItem = {
  id: string;
  eventLabel: string;
  entityLabel: string;
  title: string;
  actorLabel: string;
  projectLabel: string | null;
  timestamp: string;
  severity: FeedCardSeverity;
  badgeClassName: string;
};

function entityLabel(entityType: string): string {
  if (entityType in ARTIFACT_ENTITY_LABELS) {
    return ARTIFACT_ENTITY_LABELS[entityType as ArtifactEntityType];
  }
  return entityType.replace(/_/g, " ");
}

function auditEventSeverity(eventType: AuditEventType): FeedCardSeverity {
  if (eventType === "human_rejected") return "high";
  if (eventType === "ai_suggested") return "medium";
  if (eventType === "human_approved" || eventType === "applied") return "low";
  return "neutral";
}

function auditEventTitle(event: AuditEventRow): string {
  const metadata = event.metadata ?? {};
  const title = typeof metadata.title === "string" ? metadata.title : null;
  if (title) return title;

  if (event.artifact_review_id) {
    return `Artifact review ${event.artifact_review_id.slice(0, 8)}`;
  }
  if (event.proposal_id) {
    return `Proposal ${event.proposal_id.slice(0, 8)}`;
  }
  if (event.entity_id) {
    return `${entityLabel(event.entity_type)} ${event.entity_id.slice(0, 8)}`;
  }
  return entityLabel(event.entity_type);
}

export function formatAuditTimelineItem(
  event: AuditEventRow & {
    actor_name?: string | null;
    actor_email?: string | null;
    project_name?: string | null;
  },
): AuditTimelineItem {
  const actorLabel =
    event.actor_name?.trim() ||
    event.actor_email?.trim() ||
    (event.actor_id ? `User ${event.actor_id.slice(0, 8)}` : "System");

  return {
    id: event.id,
    eventLabel: AUDIT_EVENT_LABELS[event.event_type],
    entityLabel: entityLabel(event.entity_type),
    title: auditEventTitle(event),
    actorLabel,
    projectLabel: event.project_name ?? null,
    timestamp: event.created_at,
    severity: auditEventSeverity(event.event_type),
    badgeClassName: AUDIT_EVENT_BADGE_CLASS[event.event_type],
  };
}

export function formatAuditTimeline(
  events: Array<
    AuditEventRow & {
      actor_name?: string | null;
      actor_email?: string | null;
      project_name?: string | null;
    }
  >,
): AuditTimelineItem[] {
  return events.map(formatAuditTimelineItem);
}
