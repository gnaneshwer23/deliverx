"use client";

import { useActionState, useState } from "react";
import { setRoleAction, type RoleState } from "./actions";

const initial: RoleState = { ok: false };

const roles = [
  {
    value: "pm",
    title: "Project / Programme Manager",
    desc: "Plan delivery, run governance, ship outcomes.",
  },
  {
    value: "team_member",
    title: "Team member",
    desc: "Execute work, track tasks, collaborate.",
  },
  {
    value: "executive",
    title: "Executive",
    desc: "Oversight, reporting, decisions.",
  },
] as const;

export function RoleForm() {
  const [state, formAction, pending] = useActionState(setRoleAction, initial);
  const [selected, setSelected] = useState<string>("pm");

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="role" value={selected} />

      <div className="space-y-3">
        {roles.map((r) => {
          const active = selected === r.value;
          return (
            <button
              type="button"
              key={r.value}
              onClick={() => setSelected(r.value)}
              className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${
                active
                  ? "border-[#0F766E] bg-[#0F766E]/5 ring-2 ring-[#0F766E]/30"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex size-5 items-center justify-center rounded-full border ${
                  active
                    ? "border-[#0F766E] bg-[#0F766E] text-white"
                    : "border-slate-300 bg-white"
                }`}
              >
                {active ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
              </span>
              <span>
                <span className="block text-sm font-semibold">{r.title}</span>
                <span className="block text-xs text-slate-500">{r.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

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
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
