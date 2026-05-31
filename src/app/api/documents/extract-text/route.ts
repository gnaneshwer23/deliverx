import { requireAuth, apiErrorResponse } from "@/lib/api/auth";
import { extractTextFromBuffer, detectExtractableKind } from "@/lib/documents/extractText";

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    await requireAuth();
  } catch (err) {
    return apiErrorResponse(err);
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "file is required" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File must be under 12 MB" }, { status: 400 });
  }

  const kind = detectExtractableKind(file.name);
  if (!kind) {
    return Response.json(
      { error: "Unsupported file type. Upload PDF, DOCX, TXT, MD, or CSV." },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, file.name);
    return Response.json({
      ok: true,
      text,
      filename: file.name,
      kind,
      charCount: text.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return Response.json({ error: message }, { status: 422 });
  }
}
