/**
 * Server-side environment diagnostics — never returns secret values.
 */

export type EnvCheckItem = {
  key: string;
  ok: boolean;
  required: boolean;
  hint?: string;
};

export type EnvDiagnostics = {
  ai: {
    configured: boolean;
    provider: "minimax" | "anthropic" | null;
    model: string;
    missing: string[];
  };
  supabase: {
    ok: boolean;
    missing: string[];
  };
  app: {
    ok: boolean;
    url: string | null;
  };
  optional: {
    openai: boolean;
    cron: boolean;
  };
  checks: EnvCheckItem[];
  hints: string[];
};

function isSet(name: string): boolean {
  const v = process.env[name]?.trim();
  if (!v) return false;
  const placeholders = [
    "your-",
    "YOUR-",
    "sk-your",
    "sk-ant-your",
    "any-random-string",
  ];
  return !placeholders.some((p) => v.includes(p));
}

export function getEnvDiagnostics(model: string): EnvDiagnostics {
  const hasMinimax = isSet("MINIMAX_API_KEY");
  const hasAnthropic = isSet("ANTHROPIC_API_KEY");
  const aiConfigured = hasMinimax || hasAnthropic;

  const checks: EnvCheckItem[] = [
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      ok: isSet("NEXT_PUBLIC_SUPABASE_URL"),
      required: true,
      hint: "Supabase → Settings → API → Project URL",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ok: isSet("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      required: true,
      hint: "Supabase → Settings → API → anon public",
    },
    {
      key: "SUPABASE_SERVICE_ROLE_KEY",
      ok: isSet("SUPABASE_SERVICE_ROLE_KEY"),
      required: true,
      hint: "Supabase → service_role (server only)",
    },
    {
      key: "NEXT_PUBLIC_APP_URL",
      ok: isSet("NEXT_PUBLIC_APP_URL"),
      required: true,
      hint: "https://www.deliverx.dev in production",
    },
    {
      key: "MINIMAX_API_KEY",
      ok: hasMinimax,
      required: !hasAnthropic,
      hint: "https://www.minimax.io/ — then redeploy on Vercel",
    },
    {
      key: "ANTHROPIC_API_KEY",
      ok: hasAnthropic,
      required: !hasMinimax,
      hint: "https://console.anthropic.com/ — alternative to MiniMax",
    },
    {
      key: "OPENAI_API_KEY",
      ok: isSet("OPENAI_API_KEY"),
      required: false,
      hint: "Optional — meeting transcription & embeddings",
    },
    {
      key: "CRON_SECRET",
      ok: isSet("CRON_SECRET"),
      required: false,
      hint: "Vercel production — twin snapshot cron",
    },
  ];

  const missingRequired = checks.filter((c) => c.required && !c.ok).map((c) => c.key);
  const aiMissing = aiConfigured
    ? []
    : ["MINIMAX_API_KEY or ANTHROPIC_API_KEY"];

  const supabaseMissing = checks
    .filter((c) => c.key.startsWith("NEXT_PUBLIC_SUPABASE") || c.key === "SUPABASE_SERVICE_ROLE_KEY")
    .filter((c) => !c.ok)
    .map((c) => c.key);

  const hints: string[] = [];

  if (!aiConfigured) {
    hints.push(
      "Text AI will return no responses until MINIMAX_API_KEY or ANTHROPIC_API_KEY is set. On Vercel: Settings → Environment Variables → add the key for Production → Redeploy.",
    );
  }
  if (hasMinimax && !isSet("MINIMAX_MODEL")) {
    hints.push("MINIMAX_MODEL is optional; default is MiniMax-M2.7.");
  }
  if (isSet("MINIMAX_MODEL") && !hasMinimax && !hasAnthropic) {
    hints.push(
      "MINIMAX_MODEL alone does not enable AI — you must also set MINIMAX_API_KEY (this is a common production misconfiguration).",
    );
  }
  if (!isSet("NEXT_PUBLIC_APP_URL")) {
    hints.push("Set NEXT_PUBLIC_APP_URL to your live URL so auth redirects work.");
  }
  if (supabaseMissing.length) {
    hints.push("Fix Supabase variables or login and database calls will fail.");
  }

  return {
    ai: {
      configured: aiConfigured,
      provider: hasMinimax ? "minimax" : hasAnthropic ? "anthropic" : null,
      model,
      missing: aiMissing,
    },
    supabase: {
      ok: supabaseMissing.length === 0,
      missing: supabaseMissing,
    },
    app: {
      ok: isSet("NEXT_PUBLIC_APP_URL"),
      url: process.env.NEXT_PUBLIC_APP_URL?.trim() ?? null,
    },
    optional: {
      openai: isSet("OPENAI_API_KEY"),
      cron: isSet("CRON_SECRET"),
    },
    checks,
    hints,
  };
}
