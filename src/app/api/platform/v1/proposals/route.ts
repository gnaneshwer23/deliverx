import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { listPlatformProposals } from "@/services/platformApi";

export async function GET(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "read:proposals");
  if (authResult instanceof Response) return authResult;

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const proposals = await listPlatformProposals(authResult.auth.orgId, limit);

  return platformV1Json(
    {
      organisationId: authResult.auth.orgId,
      count: proposals.length,
      proposals,
    },
    authResult.rateHeaders,
  );
}
