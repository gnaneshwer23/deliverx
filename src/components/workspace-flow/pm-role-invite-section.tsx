"use client";

import { useCallback, useState, useTransition } from "react";
import { Check, Copy, Link2, Loader2, Mail, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
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
  inviteId?: string | null;
  expiresAt?: string | null;
};

const DEFAULT_INVITE_ROLES: Array<{ role: PersonaHomeRole; description: string }> = [
  { role: "ba", description: "Requirements, traceability, and clarification queue" },
  { role: "engineer", description: "Implementation tasks and delivery execution" },
  { role: "qa", description: "Test coverage, defects, and UAT readiness" },
  { role: "product_manager", description: "Backlog prioritisation and roadmap alignment" },
  { role: "scrum_master", description: "Sprint cadence and team coordination" },
  {
    role: "executive",
    description: "Read-only sponsor visibility — portfolio and delivery oversight",
  },
];

function JoinedStatusChip({ name }: { name: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1A6B3A]/25 bg-[#EEF5F1] px-2.5 py-1 text-xs font-medium text-[#1A6B3A]">
      <Check size={12} aria-hidden />
      Workspace live
      {name ? <span className="text-[#6B6B64]">· {name}</span> : null}
    </span>
  );
}

export function PmRoleInviteSection({
  projectId,
  rows,
  elevated = false,
}: {
  projectId: string;
  rows?: InviteRoleRow[];
  /** Prominent placement when teammates still need to join (prototype S4). */
  elevated?: boolean;
}) {
  const [localRows, setLocalRows] = useState<InviteRoleRow[]>(
    rows ??
      DEFAULT_INVITE_ROLES.map((r) => ({
        role: r.role,
        description: r.description,
        member: null,
        joinUrl: null,
        inviteActive: false,
        inviteId: null,
        expiresAt: null,
      })),
  );
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const [emailsByRole, setEmailsByRole] = useState<Partial<Record<PersonaHomeRole, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const needsLinkCount = localRows.filter((row) => !row.member && !row.joinUrl).length;
  const unjoinedCount = localRows.filter((row) => !row.member).length;

  const copyLink = useCallback(async (role: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedRole(role);
      window.setTimeout(() => setCopiedRole(null), 2000);
    } catch {
      setError("Could not copy link — select and copy manually.");
    }
  }, []);

  function applyGeneratedInvite(
    role: PersonaHomeRole,
    data: {
      joinUrl: string;
      inviteId?: string | null;
      expiresAt?: string | null;
    },
  ) {
    setLocalRows((prev) =>
      prev.map((row) =>
        row.role === role
          ? {
              ...row,
              joinUrl: data.joinUrl,
              inviteActive: true,
              inviteId: data.inviteId ?? null,
              expiresAt: data.expiresAt ?? null,
            }
          : row,
      ),
    );
  }

  function generateLink(role: PersonaHomeRole) {
    setError(null);
    const email = emailsByRole[role]?.trim().toLowerCase();
    startTransition(async () => {
      try {
        const viewMode = role === "executive" ? "read_only" : undefined;
        const res = await fetch("/api/invites/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, role, viewMode, email: email || undefined }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          joinUrl?: string;
          invite?: { id?: string; expires_at?: string };
          emailSent?: boolean;
          emailReason?: string;
          error?: string;
        };
        if (!res.ok || !data.ok || !data.joinUrl) {
          setError(data.error ?? `Could not generate ${formatInviteRoleLabel(role)} invite.`);
          return;
        }
        if (email) {
          if (data.emailSent) {
            toast.success(`Invite emailed to ${email}`, {
              description: `${formatInviteRoleLabel(role)} join link sent via email.`,
            });
          } else {
            toast.message("Link created — email not sent", {
              description: data.emailReason ?? "Email delivery is not configured.",
            });
          }
        }
        applyGeneratedInvite(role, {
          joinUrl: data.joinUrl,
          inviteId: data.invite?.id ?? null,
          expiresAt: data.invite?.expires_at ?? null,
        });
      } catch {
        setError(`Could not generate ${formatInviteRoleLabel(role)} invite.`);
      }
    });
  }

  function generateAllLinks() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/invites/generate-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          generated?: number;
          invites?: Array<{
            role: PersonaHomeRole;
            joinUrl: string;
            inviteId: string;
            expiresAt: string;
          }>;
          error?: string;
        };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Could not generate invite links.");
          return;
        }
        for (const invite of data.invites ?? []) {
          applyGeneratedInvite(invite.role, {
            joinUrl: invite.joinUrl,
            inviteId: invite.inviteId,
            expiresAt: invite.expiresAt,
          });
        }
        const count = data.generated ?? 0;
        if (count > 0) {
          toast.success(
            count === 1 ? "1 invite link generated" : `${count} invite links generated`,
            { description: "Copy or email links to onboard your delivery team." },
          );
        } else {
          toast.message("All role links are already active");
        }
      } catch {
        setError("Could not generate invite links.");
      }
    });
  }

  function revokeLink(role: PersonaHomeRole, inviteId: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/invites/${inviteId}/revoke`, { method: "DELETE" });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? `Could not revoke ${formatInviteRoleLabel(role)} invite.`);
          return;
        }
        setLocalRows((prev) =>
          prev.map((row) =>
            row.role === role
              ? {
                  ...row,
                  joinUrl: null,
                  inviteActive: false,
                  inviteId: null,
                  expiresAt: null,
                }
              : row,
          ),
        );
      } catch {
        setError(`Could not revoke ${formatInviteRoleLabel(role)} invite.`);
      }
    });
  }

  return (
    <div
      id="pm-role-invites"
      className={`${dxClass.card} overflow-hidden p-0 ${elevated ? "ring-2 ring-[#1C4A2E]/15" : ""}`}
      data-panel="pm-role-invites"
      data-elevated={elevated ? "true" : undefined}
    >
      <DxWidgetHeader
        title={elevated ? "Onboard your delivery team" : "Invite your delivery team"}
        subtitle={
          elevated
            ? `${unjoinedCount} role${unjoinedCount === 1 ? "" : "s"} still need to join — share links so each teammate lands in their workspace`
            : "Generate role-specific links — each teammate lands in their mission workspace"
        }
        trailing={
          <div className="flex items-center gap-2">
            {needsLinkCount > 0 ? (
              <button
                type="button"
                disabled={isPending}
                onClick={generateAllLinks}
                className={dxClass.btnSm}
              >
                {isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Link2 size={12} aria-hidden />
                )}
                Generate all links
              </button>
            ) : null}
            <Users size={16} className="text-[#1C4A2E]" aria-hidden />
          </div>
        }
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
                <p className="mt-1 text-xs text-[#6B6B64]">
                  Joined {new Date(row.member.joinedAt).toLocaleDateString()}
                </p>
              ) : row.inviteActive && !row.joinUrl ? (
                <p className="mt-1 text-xs text-[#6B6B64]">Invite active — generate a link to share</p>
              ) : row.inviteActive && row.expiresAt ? (
                <p className="mt-1 text-xs text-[#6B6B64]">
                  Link active · expires {new Date(row.expiresAt).toLocaleDateString()}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              {row.member ? (
                <JoinedStatusChip name={row.member.name} />
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
                  {row.inviteId ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => revokeLink(row.role, row.inviteId!)}
                      className={`${dxClass.btnGhost} text-[#9B2C2C] hover:text-[#7A2222]`}
                    >
                      <Trash2 size={14} aria-hidden />
                      Revoke
                    </button>
                  ) : null}
                </>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={emailsByRole[row.role] ?? ""}
                    onChange={(e) =>
                      setEmailsByRole((prev) => ({ ...prev, [row.role]: e.target.value }))
                    }
                    className={`${dxClass.input} max-w-xs text-xs`}
                    aria-label={`${formatInviteRoleLabel(row.role)} invite email`}
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => generateLink(row.role)}
                    className={dxClass.btnSm}
                  >
                    {isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : emailsByRole[row.role]?.trim() ? (
                      <Mail size={12} aria-hidden />
                    ) : (
                      <UserPlus size={12} aria-hidden />
                    )}
                    {emailsByRole[row.role]?.trim() ? "Send invite" : "Generate link"}
                  </button>
                </div>
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
