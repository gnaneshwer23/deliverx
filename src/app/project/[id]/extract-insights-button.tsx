"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { extractInsightsAction } from "./actions";

export function ExtractInsightsButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start gap-1">
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          setError(null);
          const result = await extractInsightsAction(projectId);
          if (result.ok) {
            router.refresh();
          } else {
            setError(result.error);
          }
        })
      }
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-indigo-200 bg-white px-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
    >
      <Sparkles size={14} />
      {pending ? "Extracting…" : "Extract insights"}
    </button>
    {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </span>
  );
}
