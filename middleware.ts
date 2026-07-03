/**
 * Legacy middleware entry — some deploy targets still invoke middleware.ts.
 * Next.js 16+ uses proxy.ts; keep both in sync.
 */
export { proxy as middleware } from "./proxy";
export { config } from "./proxy";
