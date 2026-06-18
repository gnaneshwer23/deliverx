import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import {
  createPlatformWebhookEndpoint,
  deletePlatformWebhookEndpoint,
  listPlatformWebhookEndpoints,
} from "@/services/platformWebhooks";

export async function GET() {
  try {
    await requireAuth();
    const endpoints = await listPlatformWebhookEndpoints();
    return Response.json({ endpoints });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = (await req.json()) as {
      name?: string;
      url?: string;
      events?: string[];
    };
    if (!body.name?.trim() || !body.url?.trim()) {
      return Response.json({ error: "name and url are required" }, { status: 400 });
    }
    const result = await createPlatformWebhookEndpoint({
      name: body.name,
      url: body.url,
      events: body.events ?? [],
    });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAuth();
    const body = (await req.json()) as { id?: string };
    if (!body.id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }
    await deletePlatformWebhookEndpoint(body.id);
    return Response.json({ ok: true });
  } catch (err) {
    return apiErrorResponse(err);
  }
}
