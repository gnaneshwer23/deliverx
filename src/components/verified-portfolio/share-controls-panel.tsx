"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import {
  SHARE_EXPIRY_WINDOWS,
  type ShareControlView,
} from "@/lib/verified-portfolio/share-controls";

type Props = {
  entryId: string;
};

const STATUS_STYLE: Record<ShareControlView["status"], string> = {
  active: "bg-[#EEF5F1] text-[#1C4A2E]",
  revoked: "bg-[#FBEBE9] text-[#9B2C1F]",
  expired: "bg-[#F1EFE7] text-[#6B6B64]",
};

/**
 * Phase 3 owner controls over the existing `vpp_shares` rails: create an
 * expiring share link, see each link's status, expiry, view count and
 * last-viewed time, copy it, and revoke it. Self-only — the API scopes every
 * read/write to the signed-in owner. This never lights Verified and never
 * changes what the public view discloses.
 */
export function ShareControlsPanel({ entryId }: Props) {
  const [shares, setShares] = useState<ShareControlView[]>([]);
  const [expiresInDays, setExpiresInDays] = useState<string>("90");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/portfolio/entries/${entryId}/shares`);
    if (!res.ok) {
      setShares([]);
      return;
    }
    const data = await res.json();
    setShares((data.shares ?? []) as ShareControlView[]);
  }, [entryId]);

  useEffect(() => scheduleEffectWork(() => { void load(); }), [load]);

  async function createShare() {
    setBusy(true);
    setNotice(null);
    try {
      const days = expiresInDays === "none" ? null : Number(expiresInDays);
      const res = await fetch(`/api/portfolio/entries/${entryId}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expiresInDays: days,
          label: label.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Could not create share link.");
        return;
      }
      setNotice("Share link created.");
      setLabel("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function revoke(shareId: string) {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(
        `/api/portfolio/entries/${entryId}/shares?shareId=${encodeURIComponent(shareId)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice(data.error || "Could not revoke link.");
        return;
      }
      setNotice("Link revoked. It no longer resolves.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(share: ShareControlView) {
    try {
      await navigator.clipboard.writeText(share.shareUrl);
      setCopiedId(share.id);
      setNotice("Link copied to clipboard.");
      window.setTimeout(() => setCopiedId((prev) => (prev === share.id ? null : prev)), 2000);
    } catch {
      setNotice("Copy failed — select and copy the link manually.");
    }
  }

  return (
    <section
      data-testid="portfolio-share-controls"
      className="rounded-xl border border-[#E5E2D9] bg-white p-5"
    >
      <div className="border-b border-[#E5E2D9] pb-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B6B64]">
          Share controls
        </p>
        <h3 className="mt-1 text-lg font-medium">Manage share links</h3>
        <p className="mt-1 max-w-2xl text-sm text-[#4A4A45]">
          Create a private, expiring link to this entry. The public view already hides confidential
          fields and never shows a Verified badge unless the claim is externally attested. Only you
          can see or revoke your links.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-xs text-[#6B6B64]">
          Label (optional)
          <input
            className="mt-1 w-56 rounded border border-[#E5E2D9] px-3 py-2 text-sm"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="APM application"
          />
        </label>
        <label className="block text-xs text-[#6B6B64]">
          Expires
          <select
            className="mt-1 w-40 rounded border border-[#E5E2D9] bg-white px-3 py-2 text-sm"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
          >
            {SHARE_EXPIRY_WINDOWS.map((w) => (
              <option key={w.label} value={w.days == null ? "none" : String(w.days)}>
                {w.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void createShare()}
          className="rounded-md bg-[#1C4A2E] px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          Create share link
        </button>
      </div>

      {notice ? <p className="mt-3 text-sm text-[#1C4A2E]">{notice}</p> : null}

      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-[#6B6B64]">Existing links</p>
        {shares.length === 0 ? (
          <p className="mt-2 text-sm text-[#6B6B64]">No share links yet.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {shares.map((share) => (
              <li
                key={share.id}
                className="rounded-lg border border-[#E5E2D9] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">{share.label || "Untitled link"}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${STATUS_STYLE[share.status]}`}
                    >
                      {share.statusLabel}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => void copyLink(share)}
                      className="text-[#1C4A2E] underline"
                    >
                      {copiedId === share.id ? "Copied" : "Copy link"}
                    </button>
                    {share.canRevoke ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void revoke(share.id)}
                        className="text-[#9B2C1F] underline disabled:opacity-60"
                      >
                        Revoke
                      </button>
                    ) : null}
                  </span>
                </div>
                <p className="mt-2 break-all font-mono text-[11px] text-[#6B6B64]">
                  {share.shareUrl}
                </p>
                <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#4A4A45]">
                  <span>
                    <dt className="inline text-[#6B6B64]">Views: </dt>
                    <dd className="inline font-medium">{share.viewCount}</dd>
                  </span>
                  <span>
                    <dt className="inline text-[#6B6B64]">{share.lastViewedLabel}</dt>
                  </span>
                  <span>
                    <dt className="inline text-[#6B6B64]">{share.expiresLabel}</dt>
                  </span>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
