import type { ReactNode } from "react";

const toneStyles = {
  green: "border-[#1A6B3A] bg-[#EDF7F1] text-[#1A6B3A]",
  red: "border-[#C0392B] bg-[#FDF1F0] text-[#C0392B]",
  amber: "border-[#B7620A] bg-[#FEF6EC] text-[#B7620A]",
  blue: "border-[#1A3F6B] bg-[#EDF2F9] text-[#1A3F6B]",
  slate: "border-[#E4E4DC] bg-[#F7F7F2] text-[#6B6B64]",
  accent: "border-[#C6DDD0] bg-[#EEF5F1] text-[#1C4A2E]",
} as const;

export function DxBadge({
  children,
  tone = "slate",
  dot = false,
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof toneStyles;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.12em] ${toneStyles[tone]} ${className}`}
    >
      {dot ? (
        <span className="size-1 rounded-full bg-current" aria-hidden />
      ) : null}
      {children}
    </span>
  );
}
