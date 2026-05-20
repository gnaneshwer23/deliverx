"use client";

import { Bell, ChevronDown, Search } from "lucide-react";

export function ProjectTopbar({ userEmail }: { userEmail: string | null }) {
  const initial = (userEmail ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between border-b bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
          <Search size={14} className="text-slate-500" />
          <input
            placeholder="Search projects, tasks…"
            className="w-72 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#4F46E5]"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-slate-100"
          aria-label="Account"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[#4F46E5]/10 text-sm font-semibold text-[#4F46E5]">
            {initial}
          </span>
          <ChevronDown size={14} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
}
