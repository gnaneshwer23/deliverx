import Link from "next/link";
import { Upload } from "lucide-react";
import type { LiveDataPromptConfig } from "@/lib/live-data-prompt-ctas";
import { dxClass } from "@/lib/dx-theme";

export function LiveDataPromptBanner({ message, ctas }: LiveDataPromptConfig) {
  if (ctas.length === 0) return null;

  return (
    <div
      className={`${dxClass.card} flex flex-col gap-2 border-dashed border-[#C6DDD0] bg-[#FAFAF5] px-4 py-3 text-sm text-[#6B6B64] sm:flex-row sm:items-center`}
      data-testid="mock-data-banner"
    >
      <Upload size={14} className="shrink-0 text-[#1C4A2E]" aria-hidden />
      <span>
        {message}
        {" · "}
        {ctas.map((cta, index) => (
          <span key={cta.id}>
            {index > 0 ? " · " : null}
            <Link
              href={cta.href}
              className="inline-flex min-h-9 touch-manipulation items-center text-[#1C4A2E] underline underline-offset-2 hover:text-[#163d26]"
            >
              {cta.label}
            </Link>
          </span>
        ))}
      </span>
    </div>
  );
}
