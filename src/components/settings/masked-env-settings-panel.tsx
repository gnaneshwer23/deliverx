"use client";

import { dxClass } from "@/lib/dx-theme";

type MaskedEnvRow = {
  label: string;
  status: "configured" | "missing" | "managed";
  hint: string;
};

const MASKED_VALUE = "••••••••••••";

/** Shows integration env status without exposing raw variable names or secrets. */
export function MaskedEnvSettingsPanel() {
  const rows: MaskedEnvRow[] = [
    {
      label: "Database connection",
      status: "managed",
      hint: "Managed by DeliverX hosting",
    },
    {
      label: "Authentication provider",
      status: "managed",
      hint: "Managed by DeliverX hosting",
    },
    {
      label: "Email delivery",
      status: process.env.NEXT_PUBLIC_EMAIL_CONFIGURED === "true" ? "configured" : "missing",
      hint: "Contact support to configure outbound email",
    },
    {
      label: "AI provider credentials",
      status: "configured",
      hint: "Server-side only — never shown in the browser",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6B6B64]">
        Server-side secrets are masked. Contact your workspace admin or DeliverX support to
        rotate credentials.
      </p>
      <ul className="divide-y divide-[#F0F0E8] rounded-lg border border-[#E4E4DC]">
        {rows.map((row) => (
          <li key={row.label} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#0D0D0B]">{row.label}</p>
              <p className="text-xs text-[#6B6B64]">{row.hint}</p>
            </div>
            <div className="flex items-center gap-3">
              {row.status === "configured" || row.status === "managed" ? (
                <code className="font-[family-name:var(--font-dx-mono)] text-xs text-[#A8A89E]">
                  {MASKED_VALUE}
                </code>
              ) : (
                <span className="text-xs text-[#B7620A]">Not configured</span>
              )}
              <span
                className={`${dxClass.caps} rounded px-2 py-0.5 ${
                  row.status === "missing"
                    ? "bg-[#FEF6EC] text-[#B7620A]"
                    : "bg-[#EDF7F1] text-[#1A6B3A]"
                }`}
              >
                {row.status === "missing" ? "Action needed" : "Active"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
