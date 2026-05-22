"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useFormToast(
  state: { ok: boolean; error?: string },
  messages?: { success?: string; error?: string },
) {
  const seen = useRef<string>("");

  useEffect(() => {
    const key = `${state.ok}:${state.error ?? ""}`;
    if (key === seen.current) return;
    seen.current = key;

    if (state.ok) {
      toast.success(messages?.success ?? "Saved successfully");
    } else if (state.error) {
      toast.error(state.error ?? messages?.error ?? "Something went wrong");
    }
  }, [state.ok, state.error, messages?.success, messages?.error]);
}
