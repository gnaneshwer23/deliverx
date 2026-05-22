import type { ReactNode } from "react";
import { sovereignClass } from "@/lib/sovereign-theme";

export function SovereignPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className={sovereignClass.eyebrow}>{eyebrow}</p> : null}
        <h1 className={`mt-1 ${sovereignClass.pageTitle}`}>{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4b5563]">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
