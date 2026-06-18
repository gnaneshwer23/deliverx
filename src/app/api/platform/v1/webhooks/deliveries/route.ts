import {
  authenticatePlatformRequest,
  getPlatformWebhookDeliveries,
  hasPlatformScope,
} from "@/services/platformApi";

export async function GET(req: Request) {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, "read:webhooks")) {
    return Response.json({ error: "Missing scope read:webhooks" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const deliveries = await getPlatformWebhookDeliveries(auth.orgId, limit);

  return Response.json({
    organisationId: auth.orgId,
    count: deliveries.length,
    deliveries,
  });
}
