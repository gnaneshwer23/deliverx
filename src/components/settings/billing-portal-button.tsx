"use client";

import { useState } from "react";
import { dxClass } from "@/lib/dx-theme";

export function BillingPortalButton({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        throw new Error(body.error ?? "Could not open billing portal");
      }
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Portal failed");
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className={dxClass.btnPrimary}
        disabled={!enabled || pending}
        onClick={() => void openPortal()}
      >
        {pending ? "Opening…" : "Manage billing in Stripe"}
      </button>
      {!enabled ? (
        <p className="text-sm text-[#6B6B64]">
          Stripe is not configured in this environment yet. Founder ops must set
          STRIPE_SECRET_KEY and price IDs before the customer portal opens.
        </p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
