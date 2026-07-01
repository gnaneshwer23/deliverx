/**
 * Server-side environment diagnostics — never returns secret values.
 */

import {
  getDefaultAiModel,
  isAiConfigured,
  isEnvSet,
  isOpenAiConfigured,
  resolveAiProvider,
  resolveOpenAiKeyEnvName,
} from "@/lib/ai/config";
import {
  getObservabilityDiagnostics,
  type ObservabilityDiagnostics,
} from "@/lib/observability";

export type EnvCheckItem = {
  key: string;
  ok: boolean;
  required: boolean;
  hint?: string;
};

export type EnvDiagnostics = {
  ai: {
    configured: boolean;
    provider: "openai" | "minimax" | "anthropic" | null;
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
    cron: boolean;
    email: boolean;
  };
  observability: ObservabilityDiagnostics;
  checks: EnvCheckItem[];
  hints: string[];
};

export function getEnvDiagnostics(): EnvDiagnostics {
  const provider = resolveAiProvider();
  const aiConfigured = isAiConfigured();
  const model = getDefaultAiModel();
  const observability = getObservabilityDiagnostics();

  const checks: EnvCheckItem[] = [
    {
      key: "NEXT_PUBLIC_SUPABASE_URL",
      ok: isEnvSet("NEXT_PUBLIC_SUPABASE_URL"),
      required: true,
      hint: "Supabase → Settings → API → Project URL",
    },
    {
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      ok: isEnvSet("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      required: true,
      hint: "Supabase → Settings → API → anon public",
    },
    {
      key: "SUPABASE_SERVICE_ROLE_KEY",
      ok: isEnvSet("SUPABASE_SERVICE_ROLE_KEY"),
      required: true,
      hint: "Supabase → service_role (server only)",
    },
    {
      key: "NEXT_PUBLIC_APP_URL",
      ok: isEnvSet("NEXT_PUBLIC_APP_URL"),
      required: true,
      hint: "https://www.deliverx.dev in production",
    },
    {
      key: "OPENAI_API_KEY",
      ok: isOpenAiConfigured(),
      required: true,
      hint: "https://platform.openai.com/api-keys — use exact name OPENAI_API_KEY (open_api_key also works)",
    },
    {
      key: "OPENAI_MODEL",
      ok: isEnvSet("OPENAI_MODEL"),
      required: false,
      hint: "Optional — default gpt-4o-mini",
    },
    {
      key: "INVITE_JWT_SECRET",
      ok: isEnvSet("INVITE_JWT_SECRET"),
      required: false,
      hint: "Vercel Production — explicit secret for invite JWTs (do not rely on CRON_SECRET fallback)",
    },
    {
      key: "CRON_SECRET",
      ok: isEnvSet("CRON_SECRET"),
      required: false,
      hint: "Vercel production — twin (06:00), loops (07:00), notifications digest (08:00 UTC)",
    },
    {
      key: "RESEND_API_KEY",
      ok: isEnvSet("RESEND_API_KEY"),
      required: false,
      hint: "https://resend.com — report publish emails to stakeholders",
    },
    {
      key: "EMAIL_FROM",
      ok: isEnvSet("EMAIL_FROM"),
      required: false,
      hint: "Verified sender in Resend, e.g. DeliverX <reports@yourdomain.com>",
    },
    {
      key: "Vercel Analytics (root layout)",
      ok: observability.componentPresent,
      required: false,
      hint: observability.enabledOnDeploy
        ? "Active on this deploy (production or NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=true)"
        : "Shipped in code; loads on production deploys only",
    },
  ];

  const supabaseMissing = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]
    .filter((k) => !isEnvSet(k));

  const hints: string[] = [];

  if (!aiConfigured) {
    hints.push(
      "Add OPENAI_API_KEY in Vercel → Environment Variables → Production, then redeploy. This enables assistant, project chat, reviews, and structure generation.",
    );
  } else if (provider === "openai") {
    const keyName = resolveOpenAiKeyEnvName();
    hints.push(
      `Using OpenAI (${model}) for all text AI features${keyName && keyName !== "OPENAI_API_KEY" ? ` via env var ${keyName}` : ""}.`,
    );
    if (keyName === "open_api_key") {
      hints.push(
        'Tip: rename Vercel variable open_api_key → OPENAI_API_KEY for clarity (both work today).',
      );
    }
  }

  if (!isEnvSet("NEXT_PUBLIC_APP_URL")) {
    hints.push("Set NEXT_PUBLIC_APP_URL to your live URL so auth redirects work.");
  }
  if (supabaseMissing.length) {
    hints.push("Fix Supabase variables or login and database calls will fail.");
  }
  if (!isEnvSet("INVITE_JWT_SECRET") && isEnvSet("CRON_SECRET")) {
    hints.push(
      "Set INVITE_JWT_SECRET explicitly in Production — invite JWTs currently could share CRON_SECRET via fallback.",
    );
  }
  if (!isEnvSet("RESEND_API_KEY")) {
    hints.push(
      "Optional: add RESEND_API_KEY and EMAIL_FROM to email published reports to stakeholders.",
    );
  }

  return {
    ai: {
      configured: aiConfigured,
      provider,
      model,
      missing: aiConfigured ? [] : ["OPENAI_API_KEY"],
    },
    supabase: {
      ok: supabaseMissing.length === 0,
      missing: supabaseMissing,
    },
    app: {
      ok: isEnvSet("NEXT_PUBLIC_APP_URL"),
      url: process.env.NEXT_PUBLIC_APP_URL?.trim() ?? null,
    },
    optional: {
      cron: isEnvSet("CRON_SECRET"),
      email: isEnvSet("RESEND_API_KEY"),
    },
    observability,
    checks,
    hints,
  };
}
