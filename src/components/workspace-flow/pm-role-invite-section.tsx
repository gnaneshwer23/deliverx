"use client";

import { useCallback, useState, useTransition } from "react";
import { Check, Copy, Loader2, UserPlus, Users } from "lucide-react";
import { DxWidgetHeader } from "@/components/dx/dx-widget-header";
import { formatInviteRoleLabel } from "@/lib/invite-role-labels";
import { dxClass } from "@/lib/dx-theme";
import type { PersonaHomeRole } from "@/config/role-home-routing";

export type InviteRoleRow = {
  role: PersonaHomeRole;
  description: string;
  member: { name: string | null; joinedAt: string } | null;
  joinUrl: string | null;
  inviteActive: boolean;
};

const DEFAULT_INVITE_ROLES: Array<{ role: PersonaHomeRole; description: string }> = [
  { role: "ba", description: "Requirements, traceability, and clarification queue" },
  { role: "engineer", description: "Implementation tasks and delivery execution" },
  { role: "qa", description: "Test coverage, defects, and UAT readiness" },
  { role: "product_manager", description: "Backlog prioritisation and roadmap alignment" },
  { role: "scrum_master", description: "Sprint cadence and team coordination" },
];

export function PmRoleInviteSection({
  projectId,
  rows,
}: {
  projectId: string;
  rows?: InviteRoleRow[];
}) {
  const [localRows, setLocalRows] = useState<InviteRoleRow[]>(
    rows ??
      DEFAULT_INVITE_ROLES.map((r) => ({
        role: r.role,
        description: r.description,
        member: null,
        joinUrl: null,
        inviteActive: false,
      })),
  );
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const copyLink = useCallback(async (role: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedRole(role);
      window.setTimeout(() => setCopiedRole(null), 2000);
    } catch {
      setError("Could not copy link — select and copy manually.");
    }
  }, []);

  function generateLink(role: PersonaHomeRole) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/invites/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, role }),
        });
        const data = (await res.json()) as { ok?: boolean; joinUrl?: string; error?: string };
        if (!res.ok || !data.ok || !data.joinUrl) {
          setError(data.error ?? `Could not generate ${formatInviteRoleLabel(role)} invite.`);
          return;
        }
        setLocalRows((prev) =>
          prev.map((row) =>
            row.role === role ? { ...row, joinUrl: data.joinUrl!, inviteActive: true } : row,
          ),
        );
      } catch {
        setError(`Could not generate ${formatInviteRoleLabel(role)} invite.`);
      }
    });
  }

  return (
    <div className={`${dxClass.card} overflow-hidden p-0`} data-panel="pm-role-invites">
      <DxWidgetHeader
        title="Invite your delivery team"
        subtitle="Generate role-specific links — each teammate lands in their mission workspace"
        trailing={<Users size={16} className="text-[#1C4A2E]" aria-hidden />}
      />

      <div className="divide-y divide-[var(--dx-rul)]">
        {localRows.map((row) => (
          <div
            key={row.role}
            className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6"
          >
            <div className="min-w-0">
              <p className="font-[family-name:var(--font-dx-sans)] text-sm font-medium text-[#2C2C28]">
                {formatInviteRoleLabel(row.role)}
              </p>
              <p className="mt-0.5 text-xs text-[#6B6B64]">{row.description}</p>
              {row.member ? (
                <p className="mt-1 text-xs font-medium text-[#1A6B3A]">
                  Joined · {row.member.name ?? formatInviteRoleLabel(row.role)} ·{" "}
                  {new Date(row.member.joinedAt).toLocaleDateString()}
                </p>
              ) : row.inviteActive && !row.joinUrl ? (
                <p className="mt-1 text-xs text-[#6B6B64]">Invite active — generate a link to share</p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              {row.member ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#1A6B3A]">
                  <Check size={14} aria-hidden /> Connected
                </span>
              ) : row.joinUrl ? (
                <>
                  <input
                    readOnly
                    value={row.joinUrl}
                    className={`${dxClass.input} max-w-xs text-xs`}
                    aria-label={`${formatInviteRoleLabel(row.role)} invite link`}
                  />
                  <button
                    type="button"
                    onClick={() => void copyLink(row.role, row.joinUrl!)}
                    className={dxClass.btnGhost}
                  >
                    {copiedRole === row.role ? <Check size={14} /> : <Copy size={14} />}
                    {copiedRole === row.role ? "Copied" : "Copy"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => generateLink(row.role)}
                  className={dxClass.btnSm}
                >
                  {isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <UserPlus size={12} aria-hidden />
                  )}
                  Generate link
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mx-5 mb-5 border border-[#C0392B]/30 bg-[#FDF1F0] px-3 py-2 text-sm text-[#C0392B] md:mx-6">
          {error}
        </p>
      ) : null}
    </div>
  );
}
