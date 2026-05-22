"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type ForgotState } from "./actions";

const initial: ForgotState = { ok: false };

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);

  if (state.ok) {
    return (
      <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Check your email for a password reset link. It may take a minute to
        arrive.
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 transition focus:border-[#0F766E] focus:ring-2"
        />
      </label>

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
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
