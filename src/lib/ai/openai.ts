export class OpenAiConfigError extends Error {
  constructor(message = "OpenAI API is not configured") {
    super(message);
    this.name = "OpenAiConfigError";
  }
}

export class OpenAiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAiRequestError";
  }
}

const WHISPER_MODEL = "whisper-1";
const EMBEDDING_MODEL = "text-embedding-3-small";

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new OpenAiConfigError();
  return key;
}

export async function transcribeAudio(
  file: Blob,
  filename: string,
): Promise<string> {
  const key = getApiKey();
  const body = new FormData();
  body.append("file", file, filename);
  body.append("model", WHISPER_MODEL);
  body.append("response_format", "text");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new OpenAiRequestError(
      detail || `Whisper transcription failed (${res.status})`,
    );
  }

  const text = await res.text();
  return text.trim();
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const key = getApiKey();
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new OpenAiRequestError(
      detail || `Embeddings request failed (${res.status})`,
    );
  }

  const payload = (await res.json()) as {
    data?: Array<{ embedding: number[] }>;
  };

  return (payload.data ?? []).map((row) => row.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
