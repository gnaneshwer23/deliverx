"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, Settings } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { dxClass } from "@/lib/dx-theme";

export function UserMenu({
  userEmail,
  orgName,
}: {
  userEmail?: string | null;
  orgName?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (userEmail ?? "?").charAt(0).toUpperCase();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full outline-none ring-[#1C4A2E]/30 focus-visible:ring-2"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className={`flex size-7 items-center justify-center rounded-full ${dxClass.avatar} text-[13px]`}
          title={userEmail ?? undefined}
        >
          {initial}
        </span>
        <ChevronDown size={12} className="hidden text-[#6B6B64] sm:block" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[220px] border border-[#E4E4DC] bg-white py-1 shadow-lg"
        >
          <div className="border-b border-[#F0F0E8] px-3 py-2">
            <p className="truncate text-sm font-medium text-[#0D0D0B]">{userEmail ?? "Signed in"}</p>
            {orgName ? <p className="truncate text-xs text-[#6B6B64]">{orgName}</p> : null}
          </div>
          <Link
            href="/profile"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#2C2C28] hover:bg-[#F7F7F2]"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/settings/profile"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#2C2C28] hover:bg-[#F7F7F2]"
            onClick={() => setOpen(false)}
          >
            <Settings size={14} /> Settings
          </Link>
          <SignOutButton
            showIcon
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#6B6B64] hover:bg-[#F7F7F2] hover:text-[#C0392B] disabled:opacity-60"
          />
        </div>
      ) : null}
    </div>
  );
}
