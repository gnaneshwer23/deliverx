/** Shared AI provider resolution — no API calls. */

export type AiProvider = "openai" | "minimax" | "anthropic";

/** Canonical name; aliases cover common Vercel typos. */
export const OPENAI_KEY_ENV_NAMES = [
  "OPENAI_API_KEY",
  "open_api_key",
  "OPEN_API_KEY",
] as const;

function isPlaceholder(v: string): boolean {
  const placeholders = ["your-", "YOUR-", "sk-your", "sk-ant-your", "any-random-string"];
  return placeholders.some((p) => v.includes(p));
}

export function isEnvSet(name: string): boolean {
  const v = process.env[name]?.trim();
  if (!v || isPlaceholder(v)) return false;
  return true;
}

/** Resolved env var name for OpenAI key, if any. */
export function resolveOpenAiKeyEnvName(): (typeof OPENAI_KEY_ENV_NAMES)[number] | null {
  for (const name of OPENAI_KEY_ENV_NAMES) {
    const v = process.env[name]?.trim();
    if (v && !isPlaceholder(v)) return name;
  }
  return null;
}

export function getOpenAiApiKey(): string | null {
  const name = resolveOpenAiKeyEnvName();
  if (!name) return null;
  return process.env[name]!.trim();
}

export function isOpenAiConfigured(): boolean {
  return getOpenAiApiKey() !== null;
}

/** OpenAI first when set (paid primary); MiniMax/Anthropic remain optional fallbacks. */
export function resolveAiProvider(): AiProvider | null {
  if (isOpenAiConfigured()) return "openai";
  if (isEnvSet("MINIMAX_API_KEY")) return "minimax";
  if (isEnvSet("ANTHROPIC_API_KEY")) return "anthropic";
  return null;
}

export function isAiConfigured(): boolean {
  return resolveAiProvider() !== null;
}

export function getDefaultAiModel(): string {
  const provider = resolveAiProvider();
  if (provider === "openai") {
    return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  }
  if (provider === "minimax") {
    return process.env.MINIMAX_MODEL?.trim() || "MiniMax-M2.7";
  }
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";
  }
  return "gpt-4o-mini";
}
