"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

export function InstallMarketplaceButton({
  assetId,
  installed,
}: {
  assetId: string;
  installed: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(installed);
  const [pending, start] = useTransition();

  function install() {
    setError(null);
    start(async () => {
      try {
        const res = await fetch("/api/marketplace/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetId }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Install failed");
          return;
        }
        setDone(true);
        router.refresh();
      } catch {
        setError("Network error");
      }
    });
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
        <Check size={14} /> Installed
      </span>
    );
  }

  return (
    <div className="mt-4 space-y-1">
      <button
        type="button"
        onClick={install}
        disabled={pending}
        className={`${dxClass.btnGhost} inline-flex items-center gap-1.5 text-xs`}
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        Install to playbooks
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
