import type { ReactNode } from "react";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

export function ObCard({
  step,
  title,
  description,
  children,
  wide,
  className = "",
}: {
  step?: string;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${dxClass.card} w-full p-10 md:p-12 ${wide ? "max-w-4xl" : "max-w-xl"} ${className}`}
    >
      {step ? <DxCaps accent className="mb-2.5 block">{step}</DxCaps> : null}
      <h1 className={`${dxClass.display} mb-1.5 text-[1.75rem] leading-tight text-[#0D0D0B]`}>
        {title}
      </h1>
      {description ? (
        <p className="mb-7 text-[15px] font-light leading-relaxed text-[#6B6B64]">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
