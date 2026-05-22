export class AiConfigError extends Error {
  constructor(message = "AI API is not configured") {
    super(message);
    this.name = "AiConfigError";
  }
}

export class AiGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiGenerationError";
  }
}

/** MiniMax Anthropic-compatible endpoint — https://platform.minimax.io/docs/api-reference/text-chat-anthropic */
const MINIMAX_ANTHROPIC_BASE_URL =
  process.env.MINIMAX_BASE_URL?.trim() || "https://api.minimax.io/anthropic";

export const DEFAULT_AI_MODEL =
  process.env.MINIMAX_MODEL?.trim() ||
  process.env.ANTHROPIC_MODEL?.trim() ||
  "MiniMax-M2.7";

export const DEFAULT_MAX_TOKENS = 4096;
export const DEFAULT_TIMEOUT_MS = 60_000;

function getApiKey(): string {
  const key =
    process.env.MINIMAX_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    throw new AiConfigError("Set MINIMAX_API_KEY (or ANTHROPIC_API_KEY) to enable AI.");
  }
  return key;
}

function usesMinimax(): boolean {
  return Boolean(process.env.MINIMAX_API_KEY?.trim());
}

function parseJsonBlock<T>(raw: string): T {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new AiGenerationError("Model returned invalid JSON");
  }
}

export async function generateText(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({
    apiKey: getApiKey(),
    ...(usesMinimax() ? { baseURL: MINIMAX_ANTHROPIC_BASE_URL } : {}),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const message = await client.messages.create(
      {
        model: DEFAULT_AI_MODEL,
        max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: opts.system,
        messages: [{ role: "user", content: opts.prompt }],
      },
      { signal: controller.signal },
    );

    const block = message.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new AiGenerationError("Empty model response");
    }
    return block.text;
  } catch (err) {
    if (err instanceof AiConfigError || err instanceof AiGenerationError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new AiGenerationError("AI request timed out");
    }
    throw new AiGenerationError(
      err instanceof Error ? err.message : "AI request failed",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateJSON<T>(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<T> {
  const text = await generateText({
    ...opts,
    prompt: `${opts.prompt}\n\nReturn valid JSON only. No markdown fences or commentary.`,
  });
  return parseJsonBlock<T>(text);
}

export function aiErrorStatus(err: unknown): number {
  if (err instanceof AiConfigError) return 503;
  if (err instanceof AiGenerationError) return 502;
  return 500;
}
