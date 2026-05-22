import type { ReactNode } from "react";

export function AuthPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-md">
      {children}
    </div>
  );
}

export const authInputClass =
  "mt-1 h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-[#f8f6f2] placeholder:text-[#6b7280] outline-none transition focus:border-[#6ee7c7]/50 focus:ring-2 focus:ring-[#6ee7c7]/20";

export const authLabelClass = "text-xs font-medium uppercase tracking-[0.15em] text-[#9ca3af]";

export const authButtonClass =
  "inline-flex h-11 w-full items-center justify-center rounded-full border border-[#f8f6f2]/30 bg-transparent text-[11px] font-medium uppercase tracking-[0.2em] text-[#f8f6f2] transition hover:border-[#6ee7c7] hover:text-[#6ee7c7] disabled:opacity-50";

export const authLinkClass = "text-[#6ee7c7] hover:underline";
