"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DbRole } from "@/config/persona-onboarding";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/auth-errors";
import { appendRoleToPath } from "@/lib/marketing/role-signup";
import { dxClass } from "@/lib/dx-theme";

export function SignupForm({
  invite,
  joinToken,
  preselectedRole,
}: {
  invite?: string;
  joinToken?: string;
  preselectedRole?: DbRole | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
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

    const next = joinToken
      ? `/join?token=${encodeURIComponent(joinToken)}`
      : invite
        ? `/invite/${encodeURIComponent(invite)}`
        : appendRoleToPath("/onboarding/organisation", preselectedRole);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", next);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (signUpError) {
      setError(formatAuthError(signUpError.message));
      setPending(false);
      return;
    }

    if (data.session) {
      // Full navigation ensures auth cookies reach the server before onboarding layout runs.
      window.location.assign(next);
      return;
    }

    const loginParams = new URLSearchParams();
    loginParams.set("next", next);
    loginParams.set("checkEmail", "1");
    router.push(`/login?${loginParams.toString()}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <Field label="Full name" name="name" type="text" autoComplete="name" placeholder="Alex Chen" />
      <Field
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="alex@company.com"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Minimum 8 characters"
      />

      {error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${dxClass.btnPrimary} w-full`}>
        {pending ? "Creating account…" : "Create Account →"}
      </button>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function Field({ label, name, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className={dxClass.label}>{label}</span>
      <input name={name} {...rest} className={dxClass.input} />
    </label>
  );
}
