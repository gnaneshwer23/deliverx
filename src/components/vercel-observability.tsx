import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { shouldLoadVercelObservability } from "@/lib/observability";

export function VercelObservability() {
  if (!shouldLoadVercelObservability()) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
