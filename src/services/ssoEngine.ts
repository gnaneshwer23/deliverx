/**
 * SSO engine — email domain parsing and SSO settings validation.
 */

const DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export function parseEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return normalizeDomain(trimmed.slice(at + 1));
}

export function normalizeDomain(domain: string): string | null {
  const normalized = domain.trim().toLowerCase().replace(/^@+/, "");
  if (!normalized || !DOMAIN_PATTERN.test(normalized)) return null;
  return normalized;
}

export function parseDomainList(raw: string): string[] {
  const parts = raw
    .split(/[,;\n\s]+/)
    .map((part) => normalizeDomain(part))
    .filter((part): part is string => Boolean(part));

  return [...new Set(parts)];
}

export function validateSsoSettings(input: {
  enabled: boolean;
  allowedDomains: string[];
}): { ok: boolean; error?: string } {
  if (!input.enabled) return { ok: true };

  if (input.allowedDomains.length === 0) {
    return { ok: false, error: "Add at least one email domain when SSO is enabled." };
  }

  if (input.allowedDomains.length > 20) {
    return { ok: false, error: "Maximum 20 domains per organisation." };
  }

  return { ok: true };
}

export function runSsoEngineSmokeTest(): {
  ok: boolean;
  sampleDomain: string;
} {
  const domain = parseEmailDomain("alex@acme-corp.com");
  const list = parseDomainList("acme-corp.com, nhs.uk");
  const validation = validateSsoSettings({ enabled: true, allowedDomains: list });

  return {
    ok: domain === "acme-corp.com" && list.length === 2 && validation.ok,
    sampleDomain: domain ?? "",
  };
}
