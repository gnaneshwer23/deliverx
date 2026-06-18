import { verifyRecallWebhook } from "@/lib/integrations/recall";
import { handleRecallWebhookEvent } from "@/services/recallSync";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const meetingId = url.searchParams.get("meeting")?.trim();
  if (!meetingId) {
    return Response.json({ error: "Missing meeting query parameter" }, { status: 400 });
  }

  const rawBody = await req.text();
  const secretConfigured = Boolean(process.env.RECALL_WEBHOOK_SECRET?.trim());

  if (secretConfigured) {
    const valid = verifyRecallWebhook(rawBody, {
      "webhook-id": req.headers.get("webhook-id") ?? undefined,
      "webhook-timestamp": req.headers.get("webhook-timestamp") ?? undefined,
      "webhook-signature": req.headers.get("webhook-signature") ?? undefined,
    });
    if (!valid) {
      return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const event =
    (payload.event as string | undefined) ??
    (payload.type as string | undefined) ??
    "unknown";

  const result = await handleRecallWebhookEvent({ meetingId, event, payload });
  return Response.json(result, { status: result.ok ? 200 : 422 });
}
