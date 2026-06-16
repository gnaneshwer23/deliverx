const MAX_CHARS = 120_000;

export type ExtractableKind = "pdf" | "docx" | "text";

export function detectExtractableKind(filename: string): ExtractableKind | null {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  if ([".txt", ".md", ".csv"].includes(ext)) return "text";
  return null;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const kind = detectExtractableKind(filename);
  if (!kind) {
    throw new Error("Unsupported file type. Use PDF, DOCX, TXT, MD, or CSV.");
  }

  let text = "";
  if (kind === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const parsed = await parser.getText();
      text = parsed.text ?? "";
    } finally {
      await parser.destroy();
    }
  } else if (kind === "docx") {
    const mammoth = await import("mammoth");
    const parsed = await mammoth.extractRawText({ buffer });
    text = parsed.value ?? "";
  } else {
    text = buffer.toString("utf8");
  }

  const trimmed = text.replace(/\r\n/g, "\n").trim();
  if (!trimmed) {
    throw new Error("No readable text found in this file.");
  }
  if (trimmed.length > MAX_CHARS) {
    return `${trimmed.slice(0, MAX_CHARS)}\n\n[Truncated — file exceeded ${MAX_CHARS} characters]`;
  }
  return trimmed;
}
