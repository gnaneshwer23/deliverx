import {
  authenticatePlatformRequest,
  getPlatformTwinSummary,
  hasPlatformScope,
} from "@/services/platformApi";

export async function GET(req: Request) {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, "read:twin")) {
    return Response.json({ error: "Missing scope read:twin" }, { status: 403 });
  }

  const summary = await getPlatformTwinSummary(auth.orgId);
  return Response.json({
    organisationId: auth.orgId,
    twin: summary,
  });
}
