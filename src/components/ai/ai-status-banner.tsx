"use client";

import { AlertCircle, Sparkles } from "lucide-react";

export function AiStatusBanner({
  message,
  variant = "error",
}: {
  message: string;
  variant?: "error" | "info";
}) {
  const styles =
    variant === "error"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-[#0F766E]/20 bg-[#0F766E]/5 text-[#0F766E]";

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {variant === "error" ? (
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
      ) : (
        <Sparkles size={16} className="mt-0.5 shrink-0" />
      )}
      <p>{message}</p>
    </div>
  );
}
