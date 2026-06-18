"use client";

import { useState, useTransition } from "react";
import { Key, Loader2, Trash2 } from "lucide-react";
import type { OrgApiKeyRow } from "@/services/platformApi";
import { dxClass } from "@/lib/dx-theme";

export function PlatformApiKeysForm({ keys }: { keys: OrgApiKeyRow[] }) {
  const [items, setItems] = useState(keys);
  const [name, setName] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function createKey() {
    setError(null);
    setSecret(null);
    start(async () => {
      try {
        const res = await fetch("/api/platform/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          key?: OrgApiKeyRow;
          secret?: string;
          error?: string;
        };
        if (!res.ok || !data.ok || !data.key || !data.secret) {
          setError(data.error ?? "Could not create key");
          return;
        }
        setItems((prev) => [data.key!, ...prev]);
        setSecret(data.secret);
        setName("");
      } catch {
        setError("Network error");
      }
    });
  }

  function revoke(id: string) {
    start(async () => {
      try {
        const res = await fetch("/api/platform/keys", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Could not revoke key");
          return;
        }
        setItems((prev) =>
          prev.map((k) =>
            k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k,
          ),
        );
      } catch {
        setError("Network error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6B6B64]">
        Platform API for integrations. Use{" "}
        <code className="text-xs">Authorization: Bearer dx_live_…</code> on{" "}
        <code className="text-xs">/api/platform/v1/*</code>.
      </p>
      <ul className="list-inside list-disc text-xs text-[#6B6B64]">
        <li><code>GET /api/platform/v1/projects</code> — read:projects</li>
        <li><code>GET /api/platform/v1/health</code> — read:health</li>
        <li><code>GET /api/platform/v1/twin/summary</code> — read:twin</li>
        <li><code>GET /api/platform/v1/agents/activity</code> — read:agents</li>
        <li><code>GET /api/platform/v1/learning</code> — read:learning</li>
        <li><code>POST /api/platform/v1/tasks</code> — write:tasks</li>
        <li><code>GET /api/platform/v1/proposals</code> — read:proposals</li>
        <li><code>POST /api/platform/v1/proposals/apply</code> — write:proposals</li>
        <li><code>POST /api/platform/v1/reports/publish</code> — write:reports</li>
        <li><code>GET /api/platform/v1/webhooks/deliveries</code> — read:webhooks</li>
        <li><code>GET /api/platform/v1/intelligence/loop</code> — read:intelligence</li>
      </ul>
      <p className="text-xs text-[#6B6B64]">
        Rate limit: 120 requests/minute per API key. Responses include{" "}
        <code className="text-xs">X-RateLimit-*</code> headers. AI routes are limited to 30
        generations/minute per organisation.
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name (e.g. BI dashboard)"
          className={`${dxClass.input} max-w-xs`}
        />
        <button
          type="button"
          disabled={pending || !name.trim()}
          onClick={createKey}
          className={dxClass.btnPrimary}
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
          Create API key
        </button>
      </div>

      {secret ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-900">Copy this key now — it won&apos;t be shown again:</p>
          <code className="mt-2 block break-all text-xs">{secret}</code>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}

      <ul className="space-y-2">
        {items.map((key) => (
          <li
            key={key.id}
            className="flex items-center justify-between gap-3 rounded-md border border-[#E4E4DC] px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{key.name}</p>
              <p className="text-xs text-[#6B6B64]">
                {key.keyPrefix}… · {key.revokedAt ? "Revoked" : "Active"}
                {key.lastUsedAt ? ` · last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : ""}
              </p>
            </div>
            {!key.revokedAt ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => revoke(key.id)}
                className="text-xs text-[#C0392B] hover:underline"
              >
                <Trash2 size={12} className="inline" /> Revoke
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
