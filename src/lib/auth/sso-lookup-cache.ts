import type { SsoLookupResult } from "@/services/orgSso";

type CacheEntry = {
  value: SsoLookupResult | null;
  expiresAt: number;
};

const SSO_CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function getCachedSsoLookup(domain: string): SsoLookupResult | null | undefined {
  const entry = cache.get(domain);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(domain);
    return undefined;
  }
  return entry.value;
}

export function setCachedSsoLookup(domain: string, value: SsoLookupResult | null): void {
  cache.set(domain, { value, expiresAt: Date.now() + SSO_CACHE_TTL_MS });
}

export function clearSsoLookupCache(): void {
  cache.clear();
}
