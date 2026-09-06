/** Unified project context for Professional Workspace shell. */

export type WorkspaceProjectKind = "org" | "experience";

export type WorkspaceProjectRef = {
  kind: WorkspaceProjectKind;
  id: string;
  name: string;
  subtitle?: string;
  href: string;
  status?: string;
};

export function parseWorkspaceProjectParam(
  raw: string | null | undefined,
): { kind: WorkspaceProjectKind; id: string } | null {
  if (!raw) return null;
  const [kind, ...rest] = raw.split(":");
  const id = rest.join(":").trim();
  if (!id) return null;
  if (kind === "org" || kind === "experience") return { kind, id };
  return null;
}

export function encodeWorkspaceProjectParam(ref: Pick<WorkspaceProjectRef, "kind" | "id">) {
  return `${ref.kind}:${ref.id}`;
}

/**
 * Compatibility helper for routes that still expect a raw org project UUID.
 * Accepts both the new encoded workspace param (`org:id` / `experience:id`)
 * and older plain project IDs. Experience refs intentionally resolve to null
 * for org-scoped pages.
 */
export function resolveWorkspaceOrgProjectId(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const parsed = parseWorkspaceProjectParam(raw);
  if (parsed) {
    return parsed.kind === "org" ? parsed.id : null;
  }
  const legacyProjectId = raw.trim();
  return legacyProjectId ? legacyProjectId : null;
}

export function withWorkspaceProjectParam(
  href: string,
  projectParam: string | null | undefined,
): string {
  const value = projectParam?.trim();
  if (!value) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}project=${encodeURIComponent(value)}`;
}

export function withProjectQuery(href: string, ref: WorkspaceProjectRef | null): string {
  if (!ref) return href;
  const q = encodeWorkspaceProjectParam(ref);
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}project=${encodeURIComponent(q)}`;
}

export function orgProjectRef(input: {
  id: string;
  name: string;
  status?: string | null;
}): WorkspaceProjectRef {
  return {
    kind: "org",
    id: input.id,
    name: input.name,
    subtitle: "Delivery project",
    href: `/project/${input.id}`,
    status: input.status ?? undefined,
  };
}

export function experienceProjectRef(input: {
  id: string;
  companyName: string;
  day?: number;
  status?: string | null;
}): WorkspaceProjectRef {
  return {
    kind: "experience",
    id: input.id,
    name: `${input.companyName} · Experience`,
    subtitle: input.day ? `Day ${input.day}` : "Experience project",
    href: `/experience/app`,
    status: input.status ?? undefined,
  };
}
