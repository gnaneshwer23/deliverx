import {
  authenticatePlatformRequest,
  getPlatformIntelligenceLoop,
  hasPlatformScope,
} from "@/services/platformApi";

export async function GET(req: Request) {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, "read:intelligence")) {
    return Response.json({ error: "Missing scope read:intelligence" }, { status: 403 });
  }

  const loop = await getPlatformIntelligenceLoop(auth.orgId);
  return Response.json({
    organisationId: auth.orgId,
    loop,
  });
}
