import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { listPlatformProjects } from "@/services/platformApi";

export async function GET(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "read:projects");
  if (authResult instanceof Response) return authResult;

  const projects = await listPlatformProjects(authResult.auth.orgId);
  return platformV1Json(
    {
      organisationId: authResult.auth.orgId,
      count: projects.length,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        goal: p.goal,
        deliveryType: p.delivery_type,
        updatedAt: p.updated_at,
      })),
    },
    authResult.rateHeaders,
  );
}
