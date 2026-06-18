import {
  authenticatePlatformRequest,
  createPlatformTask,
  hasPlatformScope,
} from "@/services/platformApi";

export async function POST(req: Request) {
  const auth = await authenticatePlatformRequest(req);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPlatformScope(auth.scopes, "write:tasks")) {
    return Response.json({ error: "Missing scope write:tasks" }, { status: 403 });
  }

  const body = (await req.json()) as {
    projectId?: string;
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "critical";
  };

  if (!body.projectId?.trim() || !body.title?.trim()) {
    return Response.json({ error: "projectId and title are required" }, { status: 400 });
  }

  try {
    const task = await createPlatformTask(auth.orgId, {
      projectId: body.projectId.trim(),
      title: body.title,
      description: body.description,
      priority: body.priority,
    });
    return Response.json({ ok: true, organisationId: auth.orgId, task }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create task";
    const status = message.includes("not found") ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}
