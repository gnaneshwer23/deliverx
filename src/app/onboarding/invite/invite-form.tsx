"use client";

import { useActionState, useState } from "react";
import { Copy, Check } from "lucide-react";
import { sendInviteAction, type InviteState } from "./actions";
import { buildInviteUrl } from "@/lib/invite-url";
import { StatusBadge } from "@/components/shared/status-badge";

const initial: InviteState = { ok: false };

const ROLE_LABEL: Record<string, string> = {
  pm: "Project Manager",
  team_member: "Team member",
  executive: "Executive",
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
      <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-1">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="colleague@company.com"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none ring-[#0F766E]/40 focus:border-[#0F766E] focus:ring-2"
            />
          </label>
          <label className="block sm:col-span-1">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select
              name="role"
              defaultValue="team_member"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="team_member">Team member</option>
              <option value="pm">Project Manager</option>
              <option value="executive">Executive</option>
            </select>
          </label>
        </div>
        {state.error ? (
          <p className="text-sm text-rose-600">{state.error}</p>
        ) : null}
        {state.ok && state.inviteUrl ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <p className="font-medium">Invitation created for {state.email}</p>
            <p className="mt-1 break-all text-xs text-emerald-700">{state.inviteUrl}</p>
            <p className="mt-2 text-xs text-emerald-600">
              Copy the link and send it to your teammate (email delivery can be wired later).
            </p>
          </div>
        ) : null}
        <button
          type="submit"
          disabled={pendingSubmit}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
        >
          {pendingSubmit ? "Sending…" : "Send invitation"}
        </button>
      </form>

      {pending.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Pending invitations</h2>
          <ul className="space-y-2">
            {pending.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
