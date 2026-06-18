"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { dxClass } from "@/lib/dx-theme";

type SsoLookup = {
  ssoAvailable: boolean;
  domain?: string;
  idpName?: string | null;
  ssoRequired?: boolean;
};

export function SsoLoginPanel({
  email,
  next,
  onSsoRequiredChange,
}: {
  email: string;
  next?: string;
  onSsoRequiredChange?: (required: boolean) => void;
}) {
  const [lookup, setLookup] = useState<SsoLookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const checkSso = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed.includes("@")) {
        setLookup(null);
        onSsoRequiredChange?.(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/sso/lookup?email=${encodeURIComponent(trimmed)}`);
        const json = (await res.json()) as SsoLookup;
        setLookup(json.ssoAvailable ? json : null);
        onSsoRequiredChange?.(Boolean(json.ssoAvailable && json.ssoRequired));
      } catch {
        setLookup(null);
        onSsoRequiredChange?.(false);
      }
    },
    [onSsoRequiredChange],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkSso(email);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [email, checkSso]);

  if (!lookup?.ssoAvailable || !lookup.domain) return null;

  const label = lookup.idpName?.trim() || "your organisation";

  function startSso() {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      if (next?.startsWith("/") && !next.startsWith("//")) {
        redirectTo.searchParams.set("next", next);
      }

      const { data, error: ssoError } = await supabase.auth.signInWithSSO({
        domain: lookup!.domain!,
        options: { redirectTo: redirectTo.toString() },
      });

      if (ssoError) {
        setError(ssoError.message);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError("SSO is not configured for this domain yet. Contact your admin.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="relative flex items-center py-1">
        <div className="grow border-t border-[#E4E4DC]" />
        <span className="mx-3 text-xs uppercase tracking-wide text-[#A8A89E]">or</span>
        <div className="grow border-t border-[#E4E4DC]" />
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={startSso}
        className={`${dxClass.btnGhost} flex w-full items-center justify-center gap-2 border-[#C6DDD0] text-[#1C4A2E] hover:bg-[#EEF5F1]`}
      >
        <Shield size={16} />
        {pending ? "Redirecting…" : `Continue with ${label} SSO`}
      </button>

      {lookup.ssoRequired ? (
        <p className="text-center text-xs text-[#6B6B64]">
          Password sign-in is disabled for @{lookup.domain}. Use SSO.
        </p>
      ) : null}

      {error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
