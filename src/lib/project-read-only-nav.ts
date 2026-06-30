import { READ_ONLY_PROJECT_SEGMENTS } from "@/config/project-nav";

export function isReadOnlyProjectSegment(segment: string): boolean {
  return !READ_ONLY_PROJECT_SEGMENTS.has(segment);
}

export function projectSegmentFromPathname(
  pathname: string,
  projectId: string,
): string {
  const prefix = `/project/${projectId}`;
  if (pathname === prefix || pathname === `${prefix}/`) return "";
  if (!pathname.startsWith(`${prefix}/`)) return "";
  return pathname.slice(prefix.length + 1).split("/")[0] ?? "";
}
