import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/auth";
import { requireOrgAdmin } from "@/lib/brain/require-org-admin";
import { getBrainIngestHealth, ingestBrainDocument } from "@/services/brainIngestService";

export async function GET() {
  try {
    await requireOrgAdmin();
    return NextResponse.json({ ok: true, health: getBrainIngestHealth() });
  } catch (err) {
    return apiErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireOrgAdmin();
  } catch (err) {
    return apiErrorResponse(err);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  try {
    const result = await ingestBrainDocument(file);
    return NextResponse.json({
      ok: true,
      document: result.document,
      aiConfigured: result.aiConfigured,
      textExtracted: result.textExtracted,
      health: getBrainIngestHealth(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status = message === "Not authenticated" ? 401 : message.includes("admin") ? 403 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
