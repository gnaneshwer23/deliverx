"use client";

import { useActionState, useState } from "react";
import { setRoleAction, type RoleState } from "./actions";
import { dxClass } from "@/lib/dx-theme";

const initial: RoleState = { ok: false };

const roles = [
  {
    value: "product_manager",
    title: "Product Manager",
    desc: "Vision, roadmap, prioritisation, and customer value.",
  },
  {
    value: "ba",
    title: "Business Analyst",
    desc: "Requirements, stakeholder alignment, traceability.",
  },
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
    title: "Founder / Sponsor",
    desc: "Vision, funding, decisions, investor updates, and outcomes.",
  },
] as const;

export function RoleForm() {
  const [state, formAction, pending] = useActionState(setRoleAction, initial);
  const [selected, setSelected] = useState<string>("pm");

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <input type="hidden" name="role" value={selected} />

      <div className="flex flex-col gap-2.5">
        {roles.map((r) => {
          const active = selected === r.value;
          return (
            <button
              type="button"
              key={r.value}
              onClick={() => setSelected(r.value)}
              className={`flex w-full items-start gap-3 border p-4 text-left transition ${
                active
                  ? "border-[#1C4A2E] bg-[#EEF5F1] ring-1 ring-[#C6DDD0]"
                  : "border-[#E4E4DC] bg-white hover:border-[#A8A89E]"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex size-5 items-center justify-center rounded-full border-[1.5px] ${
                  active
                    ? "border-[#1C4A2E] bg-[#1C4A2E] text-white"
                    : "border-[#E4E4DC] bg-white"
                }`}
              >
                {active ? "✓" : null}
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#0D0D0B]">{r.title}</span>
                <span className="block text-xs text-[#6B6B64]">{r.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      {state.error ? (
        <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={`${dxClass.btnPrimary} w-full`}>
        {pending ? "Saving…" : "Continue →"}
      </button>
    </form>
  );
}
