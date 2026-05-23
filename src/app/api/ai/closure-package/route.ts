import { aiRouteError } from "@/lib/api/ai-route";
import { requireProjectAccess } from "@/lib/api/auth";
import { generateClosurePackage, saveClosurePackage } from "@/services/closurePackage";
import { buildProjectDeliverySnapshot } from "@/services/projectSnapshot";

type Body = { projectId?: string; persist?: boolean };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  try {
    const { project } = await requireProjectAccess(body.projectId);
    const snapshot = await buildProjectDeliverySnapshot(body.projectId);
    const pkg = await generateClosurePackage({
      projectName: project.name,
      deliverySnapshot: snapshot,
    });

    if (body.persist !== false) {
      await saveClosurePackage(body.projectId, pkg);
    }

    return Response.json({ ok: true, package: pkg });
  } catch (err) {
    return aiRouteError(err);
  }
}
