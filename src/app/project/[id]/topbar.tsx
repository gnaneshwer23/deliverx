"use client";

import { Bell, ChevronDown, Search } from "lucide-react";

export function ProjectTopbar({ userEmail }: { userEmail: string | null }) {
  const initial = (userEmail ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between border-b border-[#1a1a1a]/8 bg-white/80 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 rounded-full border border-[#1a1a1a]/10 bg-[#f5f2ed] px-4 py-2">
          <Search size={14} className="text-[#9ca3af]" />
          <input
            placeholder="Search projects, tasks…"
            className="w-72 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-md p-1.5 text-[#6b7280] transition hover:bg-[#f5f2ed]"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-[#f5f2ed]"
          aria-label="Account"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[#0a0e14] text-sm font-semibold text-[#6ee7c7]">
            {initial}
          </span>
          <ChevronDown size={14} className="text-[#9ca3af]" />
        </button>
      </div>
    </div>
  );
}
