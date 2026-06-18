import { describe, expect, it } from "vitest";
import {
  buildPlatformEventPayload,
  isValidWebhookUrl,
  normalizeWebhookEvents,
  runPlatformWebhookEngineSmokeTest,
  shouldDeliverEvent,
  signWebhookPayload,
} from "./platformWebhookEngine";

describe("platformWebhookEngine", () => {
  it("passes smoke test", () => {
    const result = runPlatformWebhookEngineSmokeTest();
    expect(result.ok).toBe(true);
    expect(result.eventTypeCount).toBe(6);
  });

  it("rejects invalid webhook URLs", () => {
    expect(isValidWebhookUrl("not-a-url")).toBe(false);
    expect(isValidWebhookUrl("https://hooks.example.com/x")).toBe(true);
  });

  it("filters unknown event types", () => {
    expect(normalizeWebhookEvents(["task.created", "foo"])).toEqual(["task.created"]);
  });

  it("signs payloads deterministically", () => {
    const payload = buildPlatformEventPayload({
      eventId: "e1",
      type: "task.created",
      organisationId: "org",
      data: { x: 1 },
      occurredAt: "2026-01-01T00:00:00.000Z",
    });
    const body = JSON.stringify(payload);
    expect(signWebhookPayload("secret", body)).toHaveLength(64);
  });

  it("matches delivery subscriptions", () => {
    expect(shouldDeliverEvent([], "task.created")).toBe(true);
    expect(shouldDeliverEvent(["report.published"], "task.created")).toBe(false);
  });
});
