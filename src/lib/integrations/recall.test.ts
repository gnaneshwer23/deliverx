import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import {
  buildRecallWebhookUrl,
  isRecallConfigured,
  verifyRecallWebhook,
} from "@/lib/integrations/recall";

describe("recall integration", () => {
  it("reports unconfigured when RECALL_API_KEY is absent", () => {
    const prev = process.env.RECALL_API_KEY;
    delete process.env.RECALL_API_KEY;
    expect(isRecallConfigured()).toBe(false);
    if (prev) process.env.RECALL_API_KEY = prev;
  });

  it("builds webhook URL from app base", () => {
    const prev = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://app.deliverx.test";
    expect(buildRecallWebhookUrl("meet-123")).toBe(
      "https://app.deliverx.test/api/integrations/recall/webhook?meeting=meet-123",
    );
    if (prev) process.env.NEXT_PUBLIC_APP_URL = prev;
    else delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("verifies webhook signatures", () => {
    const secret = "test-secret";
    const prev = process.env.RECALL_WEBHOOK_SECRET;
    process.env.RECALL_WEBHOOK_SECRET = secret;

    const payload = JSON.stringify({ event: "transcript.done" });
    const msgId = "msg_1";
    const timestamp = "1700000000";
    const signed = `${msgId}.${timestamp}.${payload}`;
    const sig = createHmac("sha256", secret).update(signed).digest("base64");

    expect(
      verifyRecallWebhook(payload, {
        "webhook-id": msgId,
        "webhook-timestamp": timestamp,
        "webhook-signature": `v1,${sig}`,
      }),
    ).toBe(true);

    if (prev) process.env.RECALL_WEBHOOK_SECRET = prev;
    else delete process.env.RECALL_WEBHOOK_SECRET;
  });
});
