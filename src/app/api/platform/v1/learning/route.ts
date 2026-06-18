import {
  authenticatePlatformRequest,
  getPlatformLearningSummary,
  hasPlatformScope,
} from "@/services/platformApi";

export async function GET(req: Request) {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, "read:learning")) {
    return Response.json({ error: "Missing scope read:learning" }, { status: 403 });
  }

  const learning = await getPlatformLearningSummary(auth.orgId);
  return Response.json({
    organisationId: auth.orgId,
    learning,
    checkedAt: new Date().toISOString(),
  });
}
