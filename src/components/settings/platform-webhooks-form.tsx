"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, Webhook } from "lucide-react";
import { PLATFORM_EVENT_TYPES } from "@/services/platformWebhookEngine";
import type { PlatformWebhookEndpointRow } from "@/services/platformWebhooks";
import { dxClass } from "@/lib/dx-theme";

const EVENT_LABELS: Record<string, string> = {
  "task.created": "Task created",
  "proposal.applied": "Proposal applied",
  "report.published": "Report published",
  "project.go_accepted": "Project GO accepted",
};

export function PlatformWebhooksForm({
  endpoints: initial,
}: {
  endpoints: PlatformWebhookEndpointRow[];
}) {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["task.created"]);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggleEvent(event: string) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  function createEndpoint() {
    setError(null);
    setSecret(null);
    start(async () => {
      try {
        const res = await fetch("/api/platform/webhooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, url, events }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          endpoint?: PlatformWebhookEndpointRow;
          secret?: string;
          error?: string;
        };
        if (!res.ok || !data.ok || !data.endpoint || !data.secret) {
          setError(data.error ?? "Could not create webhook");
          return;
        }
        setItems((prev) => [data.endpoint!, ...prev]);
        setSecret(data.secret);
        setName("");
        setUrl("");
      } catch {
        setError("Network error");
      }
    });
  }

  function remove(id: string) {
    start(async () => {
      try {
        const res = await fetch("/api/platform/webhooks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) {
          setError(data.error ?? "Could not delete webhook");
          return;
        }
        setItems((prev) => prev.filter((item) => item.id !== id));
      } catch {
        setError("Network error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6B6B64]">
        Outbound HTTPS webhooks for integrators. DeliverX signs each payload with{" "}
        <code className="text-xs">X-DeliverX-Signature</code> (HMAC-SHA256).
      </p>

      <div className="space-y-3 rounded-lg border border-[#E4E4DC] p-4">
        <div className="flex flex-wrap gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Webhook name"
            className={`${dxClass.input} max-w-[180px]`}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://hooks.example.com/deliverx"
            className={`${dxClass.input} min-w-[240px] flex-1`}
          />
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[#6B6B64]">
          {PLATFORM_EVENT_TYPES.map((event) => (
            <label key={event} className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={events.includes(event)}
                onChange={() => toggleEvent(event)}
              />
              {EVENT_LABELS[event] ?? event}
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={pending || !name.trim() || !url.trim()}
          onClick={createEndpoint}
          className={dxClass.btnPrimary}
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Webhook size={14} />}
          Add webhook
        </button>
      </div>

      {secret ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-900">Signing secret (store securely):</p>
          <code className="mt-2 block break-all text-xs">{secret}</code>
        </div>
      ) : null}

      {error ? <p className="text-sm text-[#C0392B]">{error}</p> : null}

      <ul className="space-y-2">
        {items.map((endpoint) => (
          <li
            key={endpoint.id}
            className="flex items-start justify-between gap-3 rounded-md border border-[#E4E4DC] px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{endpoint.name}</p>
              <p className="text-xs text-[#6B6B64] break-all">{endpoint.url}</p>
              <p className="mt-1 text-xs text-[#A8A89E]">
                {endpoint.events.length > 0
                  ? endpoint.events.join(", ")
                  : "All event types"}
              </p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => remove(endpoint.id)}
              className="shrink-0 text-xs text-[#C0392B] hover:underline"
            >
              <Trash2 size={12} className="inline" /> Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
