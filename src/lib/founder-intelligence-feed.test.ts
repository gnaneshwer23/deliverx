import { describe, expect, it } from "vitest";
import {
  buildFounderIntelligenceFeed,
  isFounderRelevantAgentEvent,
  isFounderRelevantImpactEvent,
  mapAgentEventToFeedItem,
  mapImpactEventToFeedItem,
  FOUNDER_INTELLIGENCE_FEED_LIMIT,
} from "@/lib/founder-intelligence-feed";
import type { AgentActivityEventRow } from "@/services/agentOrchestration";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";

const baseImpact = (
  patch: Partial<DeliveryImpactEventRow>,
): DeliveryImpactEventRow => ({
  id: "e1",
  organisation_id: "org1",
  project_id: "p1",
  source: "proposal",
  source_id: null,
  proposal_id: null,
  action_type: "create_task",
  entity_type: "task",
  entity_id: "t1",
  target_role: "pm",
  message: "Task created",
  tone: "updated",
  created_at: "2026-06-19T10:00:00.000Z",
  project_name: "Alpha",
  ...patch,
});

const baseAgent = (patch: Partial<AgentActivityEventRow>): AgentActivityEventRow => ({
  id: "a1",
  projectId: "p1",
  projectName: "Alpha",
  workflowRunId: null,
  agentRole: "pm_agent",
  eventType: "insight",
  message: "Delivery update",
  detail: {},
  ragSourceCount: 0,
  handoffTo: null,
  humanReviewRequired: false,
  createdAt: "2026-06-19T09:00:00.000Z",
  ...patch,
});

describe("founder-intelligence-feed", () => {
  it("maps impact events with role badge and severity", () => {
    const item = mapImpactEventToFeedItem(
      baseImpact({ target_role: "founder", tone: "blocked", message: "Auth API blocker" }),
    );

    expect(item.source).toBe("impact");
    expect(item.badge).toBe("Founder");
    expect(item.severity).toBe("high");
    expect(item.message).toBe("Auth API blocker");
  });

  it("filters founder-relevant impact events", () => {
    expect(isFounderRelevantImpactEvent(baseImpact({ target_role: "founder" }))).toBe(true);
    expect(isFounderRelevantImpactEvent(baseImpact({ target_role: "ba", tone: "updated" }))).toBe(
      false,
    );
    expect(
      isFounderRelevantImpactEvent(baseImpact({ target_role: "pm", tone: "blocked" })),
    ).toBe(true);
  });

  it("maps agent events and flags human review as high severity", () => {
    const item = mapAgentEventToFeedItem(
      baseAgent({
        agentRole: "founder_agent",
        humanReviewRequired: true,
        message: "Investor review needed",
      }),
    );

    expect(item.source).toBe("agent");
    expect(item.badge).toBe("Founder Agent");
    expect(item.severity).toBe("high");
  });

  it("filters founder-relevant agent events", () => {
    expect(isFounderRelevantAgentEvent(baseAgent({ agentRole: "founder_agent" }))).toBe(true);
    expect(
      isFounderRelevantAgentEvent(baseAgent({ message: "Runway ends in 6 months" })),
    ).toBe(true);
    expect(isFounderRelevantAgentEvent(baseAgent({ message: "Sprint velocity stable" }))).toBe(
      false,
    );
  });

  it("merges and sorts feed items by recency with max limit", () => {
    const feed = buildFounderIntelligenceFeed(
      [
        baseImpact({
          id: "old",
          target_role: "founder",
          created_at: "2026-06-18T10:00:00.000Z",
        }),
        baseImpact({
          id: "new",
          target_role: "founder",
          created_at: "2026-06-19T12:00:00.000Z",
        }),
      ],
      [
        baseAgent({
          id: "agent-new",
          agentRole: "founder_agent",
          createdAt: "2026-06-19T11:00:00.000Z",
        }),
      ],
      FOUNDER_INTELLIGENCE_FEED_LIMIT,
    );

    expect(feed).toHaveLength(3);
    expect(feed[0]?.id).toBe("impact:new");
    expect(feed[1]?.id).toBe("agent:agent-new");
    expect(feed[2]?.id).toBe("impact:old");
  });

  it("caps merged feed at seven items", () => {
    const impactEvents = Array.from({ length: 5 }, (_, i) =>
      baseImpact({
        id: `i${i}`,
        target_role: "founder",
        created_at: `2026-06-19T0${i}:00:00.000Z`,
      }),
    );
    const agentEvents = Array.from({ length: 5 }, (_, i) =>
      baseAgent({
        id: `a${i}`,
        agentRole: "founder_agent",
        createdAt: `2026-06-19T1${i}:00:00.000Z`,
      }),
    );

    expect(buildFounderIntelligenceFeed(impactEvents, agentEvents)).toHaveLength(7);
  });
});
