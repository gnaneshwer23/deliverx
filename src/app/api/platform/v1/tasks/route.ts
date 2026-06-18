import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { createPlatformTask } from "@/services/platformApi";

export async function POST(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "write:tasks");
  if (authResult instanceof Response) return authResult;

  const body = (await req.json()) as {
    projectId?: string;
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "critical";
  };

  if (!body.projectId?.trim() || !body.title?.trim()) {
    return platformV1Json(
      { error: "projectId and title are required" },
      authResult.rateHeaders,
      400,
    );
  }

  try {
    const task = await createPlatformTask(authResult.auth.orgId, {
      projectId: body.projectId.trim(),
      title: body.title,
      description: body.description,
      priority: body.priority,
    });
    return platformV1Json(
      { ok: true, organisationId: authResult.auth.orgId, task },
      authResult.rateHeaders,
      201,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create task";
    const status = message.includes("not found") ? 404 : 400;
    return platformV1Json({ error: message }, authResult.rateHeaders, status);
  }
}
