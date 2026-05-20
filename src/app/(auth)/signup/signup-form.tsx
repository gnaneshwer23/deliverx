"use client";

import { useActionState } from "react";
import { signupAction, type SignupState } from "./actions";

const initial: SignupState = { ok: false };

export function SignupForm({ invite }: { invite?: string }) {
  const [state, formAction, pending] = useActionState(signupAction, initial);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {invite ? <input type="hidden" name="invite" value={invite} /> : null}

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

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white transition hover:bg-[#0E6B62] disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-center text-xs text-slate-500">
        By signing up you agree to our Terms and Privacy Policy.
      </p>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function Field({ label, name, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        {...rest}
        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
      />
    </label>
  );
}
