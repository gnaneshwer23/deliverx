"use client";

import { useActionState, useState } from "react";
import { Copy, Check } from "lucide-react";
import { sendInviteAction, type InviteState } from "./actions";
import { buildInviteUrl } from "@/lib/invite-url";
import { StatusBadge } from "@/components/shared/status-badge";
import { dxClass } from "@/lib/dx-theme";

const initial: InviteState = { ok: false };

const ROLE_LABEL: Record<string, string> = {
  pm: "Project Manager",
  engineer: "Engineer",
  team_member: "Team member",
  executive: "Founder / Sponsor",
  ba: "Business Analyst",
  product_manager: "Product Manager",
};

export function InviteForm({
  pending,
}: {
  pending: Array<{
    id: string;
    email: string;
    role: string;
    token: string;
    expires_at: string;
  }>;
}) {
  const [state, action, pendingSubmit] = useActionState(sendInviteAction, initial);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(buildInviteUrl(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mt-6 space-y-6">
      <form action={action} className="space-y-4 border border-[#E4E4DC] bg-[#F7F7F2] p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-1">
            <span className={dxClass.label}>Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="colleague@company.com"
              className={dxClass.input}
            />
          </label>
          <label className="block sm:col-span-1">
            <span className={dxClass.label}>Role</span>
            <select name="role" defaultValue="team_member" className={dxClass.input}>
              <option value="engineer">Engineer</option>
              <option value="team_member">Team member</option>
              <option value="ba">Business Analyst</option>
              <option value="product_manager">Product Manager</option>
              <option value="pm">Project Manager</option>
              <option value="executive">Founder / Sponsor</option>
            </select>
          </label>
        </div>
        {state.error ? (
          <p className="border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B]">
            {state.error}
          </p>
        ) : null}
        {state.ok && state.inviteUrl ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <p className="font-medium">Invitation created for {state.email}</p>
            <p className="mt-1 break-all text-xs text-emerald-700">{state.inviteUrl}</p>
            <p className="mt-2 text-xs text-emerald-600">
              Copy the link and send it to your teammate.
            </p>
          </div>
        ) : null}
        <button
          type="submit"
          disabled={pendingSubmit}
          className={`${dxClass.btnPrimary} disabled:opacity-50`}
        >
          {pendingSubmit ? "Creating…" : "Create invitation"}
        </button>
      </form>

      {pending.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[#1a1a1a]">Pending invitations</h2>
          <ul className="space-y-2">
            {pending.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1a1a1a]/8 bg-white px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{inv.email}</span>
                  <span className="mx-2 text-slate-300">·</span>
                  <span className="text-slate-500">{ROLE_LABEL[inv.role] ?? inv.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="pending" />
                  <button
                    type="button"
                    onClick={() => copyLink(inv.token)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    {copied === inv.token ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy size={12} />
                    )}
                    Copy link
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
