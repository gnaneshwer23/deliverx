"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/auth-errors";
import { dxClass } from "@/lib/dx-theme";

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
      <div className="border border-[#C6DDD0] bg-[#EEF5F1] px-3 py-3 text-sm text-[#1C4A2E]">
        If an account exists for that email, we&apos;ve sent a reset link.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className={dxClass.label}>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className={`${dxClass.input} mt-1.5`}
        />
      </label>

      {error ? (
        <p
          className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${dxClass.btnPrimary} w-full`}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
