"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import type { DeliveryAlert } from "@/services/alerts";
import { DxBadge } from "@/components/dx/dx-badge";
import { dxClass } from "@/lib/dx-theme";

const TONE: Record<DeliveryAlert["severity"], "red" | "amber" | "green" | "slate"> = {
  critical: "red",
  high: "amber",
  medium: "slate",
  low: "slate",
};

export function AlertBellDropdown({
  alerts,
  unreadCount,
}: {
  alerts: DeliveryAlert[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative hidden sm:block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${dxClass.btnGhost} relative px-2.5 py-2`}
        aria-label={`Alerts${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell size={14} aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-[#C0392B] px-1 text-center font-[family-name:var(--font-dx-mono)] text-xs font-medium leading-[18px] text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-[min(360px,calc(100vw-2rem))] border border-[#E4E4DC] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[#E4E4DC] px-3 py-2">
            <span className="text-xs font-semibold text-[#0D0D0B]">Active alerts</span>
            <Link
              href="/workspace/alerts"
              className="text-[10px] text-[#1C4A2E] hover:underline"
              onClick={() => setOpen(false)}
            >
              View all
            </Link>
          </div>

          {alerts.length === 0 ? (
            <p className="px-3 py-4 text-xs text-[#6B6B64]">No active alerts right now.</p>
          ) : (
            <ul className="max-h-80 overflow-y-auto divide-y divide-[#E4E4DC]">
              {alerts.slice(0, 8).map((a) => (
                <li key={a.id}>
                  {a.href ? (
                    <Link
                      href={a.href}
                      className="block px-3 py-2.5 hover:bg-[#F7F7F2]"
                      onClick={() => setOpen(false)}
                    >
                      <AlertRow alert={a} />
                    </Link>
                  ) : (
                    <div className="px-3 py-2.5">
                      <AlertRow alert={a} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function AlertRow({ alert }: { alert: DeliveryAlert }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center gap-1.5">
        <DxBadge tone={TONE[alert.severity]}>{alert.severity}</DxBadge>
        <span className="font-[family-name:var(--font-dx-mono)] text-xs uppercase text-[#4B5563]">
          {alert.category}
        </span>
      </div>
      <p className="text-sm font-medium text-[#0D0D0B]">{alert.title}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-[#6B6B64]">{alert.description}</p>
    </div>
  );
}
