import Link from "next/link";
import { Upload } from "lucide-react";
import { dxClass } from "@/lib/dx-theme";

export const FALLBACK_KPI_HINT = "Illustrative — upload context";

export function MockDataBanner({
  message,
  uploadHref = "/workspace/assistant",
  linkLabel = "Upload context",
}: {
  message: string;
  uploadHref?: string;
  linkLabel?: string;
}) {
  return (
    <div
      className={`${dxClass.card} flex items-center gap-2 border-dashed border-[#C6DDD0] bg-[#FAFAF5] px-4 py-3 text-sm text-[#6B6B64]`}
      data-testid="mock-data-banner"
    >
      <Upload size={14} className="shrink-0 text-[#1C4A2E]" aria-hidden />
      <span>
        {message}
        {uploadHref ? (
          <>
            {" · "}
            <Link
              href={uploadHref}
              className="text-[#1C4A2E] underline underline-offset-2 hover:text-[#163d26]"
            >
              {linkLabel}
            </Link>
          </>
        ) : null}
      </span>
    </div>
  );
}
