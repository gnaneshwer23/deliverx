import Link from "next/link";
import type { ReactNode } from "react";
import { Cpu } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

export function DxLogo({
  href = "/",
  showTag = false,
  dark = false,
}: {
  href?: string;
  showTag?: boolean;
  dark?: boolean;
}) {
  const inner = (
    <span className="flex items-center gap-2.5">
      <span
        className={`flex size-8 shrink-0 items-center justify-center border-[1.5px] ${
          dark ? "border-[#3D9660]" : "border-[#1C4A2E]"
        }`}
      >
        <Cpu size={12} className={dark ? "text-[#3D9660]" : "text-[#1C4A2E]"} strokeWidth={2} />
      </span>
      <span
        className={`${dxClass.display} text-xl tracking-tight ${dark ? "text-white" : "text-[#0D0D0B]"}`}
      >
        DeliverX
      </span>
      {showTag ? (
        <span className="border border-[#C6DDD0] bg-[#EEF5F1] px-1.5 py-0.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.18em] text-[#1C4A2E]">
          OS
        </span>
      ) : null}
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function DxCaps({
  children,
  accent = false,
  className = "",
}: {
  children: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <span className={`${accent ? dxClass.capsAcc : dxClass.caps} ${className}`}>{children}</span>
  );
}
