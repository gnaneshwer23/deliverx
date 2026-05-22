"use client";

import { useState } from "react";
import Link from "next/link";
import {
  authButtonClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "@/components/marketing/auth-panel";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/auth-errors";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const email = String(new FormData(event.currentTarget).get("email") ?? "")
      .trim()
      .toLowerCase();

    if (!email) {
      setError("Email is required.");
      setPending(false);
      return;
    }

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/login/reset")}`,
    });

    setPending(false);
    if (resetError) {
      setError(formatAuthError(resetError.message));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-lg border border-[#6ee7c7]/30 bg-[#6ee7c7]/10 px-3 py-3 text-sm text-[#6ee7c7]">
        If an account exists for that email, we&apos;ve sent a reset link.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className={authLabelClass}>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className={authInputClass}
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-sm text-[#9ca3af]">
        <Link href="/login" className={authLinkClass}>
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
