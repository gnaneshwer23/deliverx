import {
  authenticatePlatformRequest,
  getPlatformAgentActivity,
  hasPlatformScope,
} from "@/services/platformApi";

export async function GET(req: Request) {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, "read:agents")) {
    return Response.json({ error: "Missing scope read:agents" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);
  const events = await getPlatformAgentActivity(auth.orgId, limit);

  return Response.json({
    organisationId: auth.orgId,
    count: events.length,
    events,
  });
}
