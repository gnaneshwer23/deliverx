import {
  getDefaultAiModel,
  getOpenAiApiKey,
  isAiConfigured,
  resolveAiProvider,
  type AiProvider,
} from "@/lib/ai/config";

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

/** MiniMax Anthropic-compatible endpoint */
const MINIMAX_ANTHROPIC_BASE_URL =
  process.env.MINIMAX_BASE_URL?.trim() || "https://api.minimax.io/anthropic";

export const DEFAULT_AI_MODEL = getDefaultAiModel();
export const DEFAULT_MAX_TOKENS = 4096;
export const DEFAULT_TIMEOUT_MS = 60_000;

export { resolveAiProvider, isAiConfigured, type AiProvider };

function requireProvider(): AiProvider {
  const provider = resolveAiProvider();
  if (!provider) {
    throw new AiConfigError(
      "Set OPENAI_API_KEY to enable AI (recommended). Optional fallbacks: MINIMAX_API_KEY or ANTHROPIC_API_KEY.",
    );
  }
  return provider;
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

async function generateTextOpenAI(
  opts: {
    system: string;
    prompt: string;
    maxTokens?: number;
    timeoutMs?: number;
  },
  jsonMode: boolean,
): Promise<string> {
  const key = getOpenAiApiKey();
  if (!key) throw new AiConfigError("OPENAI_API_KEY is not set");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getDefaultAiModel(),
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.prompt },
        ],
        max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: 0.2,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new AiGenerationError(
        detail.slice(0, 500) || `OpenAI request failed (${res.status})`,
      );
    }

    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) throw new AiGenerationError("Empty model response");
    return text;
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

async function generateTextAnthropicCompat(
  opts: {
    system: string;
    prompt: string;
    maxTokens?: number;
    timeoutMs?: number;
  },
  provider: "minimax" | "anthropic",
): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const apiKey =
    provider === "minimax"
      ? process.env.MINIMAX_API_KEY!.trim()
      : process.env.ANTHROPIC_API_KEY!.trim();

  const client = new Anthropic({
    apiKey,
    ...(provider === "minimax" ? { baseURL: MINIMAX_ANTHROPIC_BASE_URL } : {}),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const message = await client.messages.create(
      {
        model: getDefaultAiModel(),
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

export async function generateText(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<string> {
  const provider = requireProvider();
  if (provider === "openai") {
    return generateTextOpenAI(opts, false);
  }
  return generateTextAnthropicCompat(opts, provider);
}

export async function generateJSON<T>(opts: {
  system: string;
  prompt: string;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<T> {
  const provider = requireProvider();
  if (provider === "openai") {
    const text = await generateTextOpenAI(
      {
        ...opts,
        system: `${opts.system}\n\nYou must respond with a single valid JSON object.`,
        prompt: `${opts.prompt}\n\nReturn valid JSON only.`,
      },
      true,
    );
    return parseJsonBlock<T>(text);
  }

  const text = await generateTextAnthropicCompat(
    {
      ...opts,
      prompt: `${opts.prompt}\n\nReturn valid JSON only. No markdown fences or commentary.`,
    },
    provider,
  );
  return parseJsonBlock<T>(text);
}

export function aiErrorStatus(err: unknown): number {
  if (err instanceof AiConfigError) return 503;
  if (err instanceof AiGenerationError) return 502;
  return 500;
}
