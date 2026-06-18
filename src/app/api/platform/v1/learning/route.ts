import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { getPlatformLearningSummary } from "@/services/platformApi";

export async function GET(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "read:learning");
  if (authResult instanceof Response) return authResult;

  const learning = await getPlatformLearningSummary(authResult.auth.orgId);
  return platformV1Json(
    {
      organisationId: authResult.auth.orgId,
      learning,
      checkedAt: new Date().toISOString(),
    },
    authResult.rateHeaders,
  );
}
