"use client";

import { ErrorFallback } from "@/components/shared/error-fallback";

export default function ProjectError({
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
      title="Project error"
      description="This project page failed to load. Try again or return to your project list."
    />
  );
}
