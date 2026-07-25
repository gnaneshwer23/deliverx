"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import type { NotificationRecord } from "@/lib/notifications";

export function NotificationInbox() {
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/pi/notifications?limit=20");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load notifications");
        if (!cancelled) {
          setItems(data.notifications ?? []);
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Could not load notifications");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function markRead(notificationIds?: string[]) {
    const response = await fetch("/api/pi/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificationIds ? { notificationIds } : { all: true }),
    });
    if (!response.ok) return;
    const selected = notificationIds ? new Set(notificationIds) : null;
    setItems((current) =>
      current.map((item) =>
        !selected || selected.has(item.id)
          ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
          : item,
      ),
    );
    setUnreadCount((current) =>
      selected
        ? Math.max(
            0,
            current -
              items.filter((item) => selected.has(item.id) && item.readAt === null).length,
          )
        : 0,
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="pi-notification-inbox"
        className="relative inline-flex items-center gap-2 rounded-md border border-[#D6D3C8] bg-white px-3 py-2 text-xs font-medium text-[#1A1A18]"
      >
        <Bell size={14} aria-hidden />
        Notifications
        {unreadCount > 0 ? (
          <span className="min-w-5 rounded-full bg-[#1C4A2E] px-1.5 py-0.5 text-center text-[10px] text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <section
          id="pi-notification-inbox"
          aria-label="Professional Intelligence notifications"
          className="absolute right-0 z-20 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-[#D6D3C8] bg-white"
        >
          <div className="flex items-center justify-between border-b border-[#E5E2D9] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-[#1A1A18]">Notifications</h2>
              <p className="text-[11px] text-[#6B6B64]">
                Reviews, privacy actions, and development prompts.
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markRead()}
                className="text-[11px] font-medium text-[#1C4A2E] underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {error ? (
            <p className="px-4 py-4 text-xs text-red-700">{error}</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-5 text-xs text-[#6B6B64]">
              No notifications. New items will appear when a review, privacy action, or
              evidence-linked intervention needs attention.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-[#E5E2D9] overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className={item.readAt ? "bg-white" : "bg-[#FAFAF7]"}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (!item.readAt) void markRead([item.id]);
                      setOpen(false);
                    }}
                    className="block px-4 py-3 hover:bg-[#F4F3ED]"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                          item.readAt ? "bg-[#C7C5BC]" : "bg-[#1C4A2E]"
                        }`}
                      />
                      <div>
                        <p className="text-xs font-medium text-[#1A1A18]">{item.title}</p>
                        {item.body ? (
                          <p className="mt-1 line-clamp-2 text-[11px] text-[#6B6B64]">
                            {item.body}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-[#8A8982]">
                          {item.kind.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
