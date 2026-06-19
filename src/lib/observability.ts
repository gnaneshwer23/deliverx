import { existsSync } from "fs";
import { resolve } from "path";

const observabilityComponentPath = resolve(
  process.cwd(),
  "src/components/vercel-observability.tsx",
);

/** Load Vercel Analytics + Speed Insights on production deploys, or when explicitly enabled. */
export function shouldLoadVercelObservability(): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true") return true;
  return process.env.VERCEL_ENV === "production";
}

export function isVercelObservabilityComponentPresent(): boolean {
  return existsSync(observabilityComponentPath);
}

export type ObservabilityDiagnostics = {
  componentPresent: boolean;
  enabledOnDeploy: boolean;
  vercelEnv: string | null;
};

export function getObservabilityDiagnostics(): ObservabilityDiagnostics {
  return {
    componentPresent: isVercelObservabilityComponentPresent(),
    enabledOnDeploy: shouldLoadVercelObservability(),
    vercelEnv: process.env.VERCEL_ENV?.trim() ?? null,
  };
}
