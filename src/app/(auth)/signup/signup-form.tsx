"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatAuthError } from "@/lib/auth-errors";
import { dxClass } from "@/lib/dx-theme";

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
