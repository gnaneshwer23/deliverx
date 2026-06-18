import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { getPlatformTwinSummary } from "@/services/platformApi";

export async function GET(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "read:twin");
  if (authResult instanceof Response) return authResult;

  const summary = await getPlatformTwinSummary(authResult.auth.orgId);
  return platformV1Json(
    {
      organisationId: authResult.auth.orgId,
      twin: summary,
    },
    authResult.rateHeaders,
  );
}
