import {
  authenticatePlatformRequest,
  hasPlatformScope,
  listPlatformProjects,
} from "@/services/platformApi";

export async function GET(req: Request) {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, "read:projects")) {
    return Response.json({ error: "Missing scope read:projects" }, { status: 403 });
  }

  const projects = await listPlatformProjects(auth.orgId);
  return Response.json({
    organisationId: auth.orgId,
    count: projects.length,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      goal: p.goal,
      deliveryType: p.delivery_type,
      updatedAt: p.updated_at,
    })),
  });
}
