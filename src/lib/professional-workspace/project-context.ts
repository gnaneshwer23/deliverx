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
