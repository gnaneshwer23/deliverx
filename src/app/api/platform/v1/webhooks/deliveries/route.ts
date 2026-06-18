import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { getPlatformWebhookDeliveries } from "@/services/platformApi";

export async function GET(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "read:webhooks");
  if (authResult instanceof Response) return authResult;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const deliveries = await getPlatformWebhookDeliveries(authResult.auth.orgId, limit);

  return platformV1Json(
    {
      organisationId: authResult.auth.orgId,
      count: deliveries.length,
      deliveries,
    },
    authResult.rateHeaders,
  );
}
