import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { getPlatformIntelligenceLoop } from "@/services/platformApi";

export async function GET(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "read:intelligence");
  if (authResult instanceof Response) return authResult;

  const loop = await getPlatformIntelligenceLoop(authResult.auth.orgId);
  return platformV1Json(
    {
      organisationId: authResult.auth.orgId,
      loop,
    },
    authResult.rateHeaders,
  );
}
