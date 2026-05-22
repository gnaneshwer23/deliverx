import type { ReactNode } from "react";
import { sovereignClass } from "@/lib/sovereign-theme";

export function SovereignCard({
  children,
  className = "",
  title,
  description,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className={`${sovereignClass.card} p-8 ${className}`}>
      {title ? (
        <header className="mb-6">
          <h1 className={sovereignClass.pageTitle}>{title}</h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{description}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
