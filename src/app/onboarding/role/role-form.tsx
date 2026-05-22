"use client";

import { useActionState, useState } from "react";
import { setRoleAction, type RoleState } from "./actions";
import { SovereignError } from "@/components/sovereign/sovereign-form";
import { sovereignClass } from "@/lib/sovereign-theme";

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
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="role" value={selected} />

      <div className="space-y-3">
        {roles.map((r) => {
          const active = selected === r.value;
          return (
            <button
              type="button"
              key={r.value}
              onClick={() => setSelected(r.value)}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                active
                  ? "border-[#6ee7c7]/50 bg-[#6ee7c7]/10 ring-2 ring-[#6ee7c7]/20"
                  : "border-[#1a1a1a]/10 bg-white hover:border-[#1a1a1a]/20"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex size-5 items-center justify-center rounded-full border ${
                  active
                    ? "border-[#0a0e14] bg-[#0a0e14] text-[#6ee7c7]"
                    : "border-[#1a1a1a]/15 bg-white"
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
                <span className="block text-sm font-semibold text-[#1a1a1a]">{r.title}</span>
                <span className="block text-xs text-[#6b7280]">{r.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {state.error ? <SovereignError>{state.error}</SovereignError> : null}

      <button
        type="submit"
        disabled={pending}
        className={`${sovereignClass.pillPrimary} h-11 w-full disabled:opacity-50`}
      >
        {pending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
