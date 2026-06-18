"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Link2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createStakeholderShareAction,
  revokeStakeholderShareAction,
  type ShareActionState,
} from "@/app/project/[id]/stakeholders/share-actions";
import type { StakeholderShareLinkWithUrl } from "@/services/stakeholderShare";

const initial: ShareActionState = { ok: false };

export function StakeholderSharePanel({
  projectId,
  links: initialLinks,
}: {
  projectId: string;
  links: StakeholderShareLinkWithUrl[];
}) {
  const router = useRouter();
  const [createState, createAction, creating] = useActionState(
    createStakeholderShareAction,
    initial,
  );
  const [revokeState, revokeAction, revoking] = useActionState(
    revokeStakeholderShareAction,
    initial,
  );

  useEffect(() => {
    if (createState.ok) {
      toast.success("Share link created");
      router.refresh();
    } else if (createState.error) {
      toast.error(createState.error);
    }
  }, [createState, router]);

  useEffect(() => {
    if (revokeState.ok) {
      toast.success("Share link revoked");
      router.refresh();
    } else if (revokeState.error) {
      toast.error(revokeState.error);
    }
  }, [revokeState, router]);

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  const links = initialLinks;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <Link2 size={18} className="mt-0.5 text-[#0F766E]" />
        <div>
          <h3 className="font-semibold text-slate-900">External stakeholder links</h3>
          <p className="text-sm text-slate-500">
            Generate magic links for sponsors and executives — read-only health, forecast,
            milestones, and RAID summary. Links expire after 30 days.
          </p>
        </div>
      </div>

      <form action={createAction} className="space-y-3 border-b border-slate-100 pb-4">
        <input type="hidden" name="projectId" value={projectId} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Label</span>
            <input
              name="label"
              placeholder="Board Q2 update"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Recipient email (optional)</span>
            <input
              name="recipientEmail"
              type="email"
              placeholder="sponsor@company.com"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62] disabled:opacity-60"
        >
          {creating ? <Loader2 size={14} className="animate-spin" /> : null}
          Create share link
        </button>
        {createState.error ? <p className="text-sm text-rose-600">{createState.error}</p> : null}
      </form>

      {links.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No active share links yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">
                  {link.label ?? "Stakeholder view"}
                  {link.status !== "active" ? (
                    <span className="ml-2 text-xs capitalize text-rose-600">{link.status}</span>
                  ) : null}
                </p>
                <p className="text-xs text-slate-500">
                  Expires {new Date(link.expires_at).toLocaleDateString()}
                  {link.view_count > 0 ? ` · ${link.view_count} view${link.view_count === 1 ? "" : "s"}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {link.status === "active" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => copyUrl(link.shareUrl)}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                    <form action={revokeAction}>
                      <input type="hidden" name="linkId" value={link.id} />
                      <input type="hidden" name="projectId" value={projectId} />
                      <button
                        type="submit"
                        disabled={revoking}
                        className="inline-flex h-8 items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                      >
                        <Trash2 size={12} />
                        Revoke
                      </button>
                    </form>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {revokeState.error ? <p className="mt-2 text-sm text-rose-600">{revokeState.error}</p> : null}
    </div>
  );
}
