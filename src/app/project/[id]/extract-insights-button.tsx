"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { extractInsightsAction } from "./actions";

export function ExtractInsightsButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await extractInsightsAction(projectId);
          if (result.ok) router.refresh();
        })
      }
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-indigo-200 bg-white px-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
    >
      <Sparkles size={14} />
      {pending ? "Extracting…" : "Extract insights"}
    </button>
  );
}
