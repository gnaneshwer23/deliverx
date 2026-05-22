"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Workspace error"
      description="This workspace page failed to load. Try again or pick another section from the sidebar."
    />
  );
}
