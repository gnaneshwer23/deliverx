"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  authButtonClass,
  authInputClass,
  authLabelClass,
} from "@/components/marketing/auth-panel";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/auth-errors";

export function SignupForm({ invite }: { invite?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();

    if (!email || !password) {
      setError("Email and password are required.");
      setPending(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setPending(false);
      return;
    }

    const next = invite
      ? `/invite/${encodeURIComponent(invite)}`
      : "/onboarding/organisation";

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpError) {
      setError(formatAuthError(signUpError.message));
      setPending(false);
      return;
    }

    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    router.push(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Field
        label="Full name"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Ada Lovelace"
      />
      <Field
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@company.com"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="At least 8 characters"
      />

      {error ? (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs text-[#6b7280]">
        By signing up you agree to our Terms and Privacy Policy.
      </p>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function Field({ label, name, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className={authLabelClass}>{label}</span>
      <input name={name} {...rest} className={authInputClass} />
    </label>
  );
}
