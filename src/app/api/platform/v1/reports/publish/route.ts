import {
  authorizePlatformV1Request,
  platformV1Json,
} from "@/lib/platform-v1";
import { publishPlatformReport } from "@/services/platformApi";

export async function POST(req: Request) {
  const authResult = await authorizePlatformV1Request(req, "write:reports");
  if (authResult instanceof Response) return authResult;

  const body = (await req.json()) as {
    reportId?: string;
    stakeholderEmails?: string[];
  };

  if (!body.reportId?.trim()) {
    return platformV1Json({ error: "reportId is required" }, authResult.rateHeaders, 400);
  }

  try {
    const report = await publishPlatformReport(
      authResult.auth.orgId,
      body.reportId.trim(),
      body.stakeholderEmails ?? [],
    );
    return platformV1Json(
      { ok: true, organisationId: authResult.auth.orgId, report },
      authResult.rateHeaders,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not publish report";
    const status = message.includes("not found")
      ? 404
      : message.includes("already published")
        ? 409
        : 400;
    return platformV1Json({ error: message }, authResult.rateHeaders, status);
  }
}
