import { verifyGitHubWebhookSignature } from "@/services/githubWebhookEngine";
import {
  getOrgIntegrationForWebhook,
  processGitHubWebhook,
} from "@/services/githubIntegration";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get("org")?.trim();
  if (!orgId) {
    return Response.json({ error: "Missing org query parameter" }, { status: 400 });
  }

  const orgSettings = await getOrgIntegrationForWebhook(orgId);
  if (!orgSettings?.github_webhook_secret) {
    return Response.json({ error: "Webhook secret not configured" }, { status: 404 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  if (!verifyGitHubWebhookSignature(orgSettings.github_webhook_secret, rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = req.headers.get("x-github-event") ?? "unknown";
  const deliveryId = req.headers.get("x-github-delivery");

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const result = await processGitHubWebhook({
    orgId,
    event,
    payload,
    deliveryId,
  });

  return Response.json(result, { status: result.ok ? 200 : 422 });
}
