/**
 * Nav coherence engine — pure checks that nav hrefs map to real routes.
 */

import { allProjectNavSegments } from "@/config/project-nav";
import {
  allWorkspaceNavHrefs,
  workspaceEcosystemNav,
  workspaceIntelligenceNav,
} from "@/config/workspace-nav";

export type NavCoherenceCheck = {
  route: string;
  ok: boolean;
  sprint: string;
};

const E5_ECOSYSTEM_ROUTES = workspaceEcosystemNav.map((item) => item.href);

const E5_PROJECT_SEGMENTS = ["benefits", "milestones", "closure"] as const;

export function workspaceHrefToAppPath(href: string): string {
  const pathOnly = href.split("?")[0] ?? href;
  const trimmed = pathOnly.replace(/^\//, "");
  return `src/app/${trimmed}/page.tsx`;
}

export function projectSegmentToAppPath(segment: string): string {
  return `src/app/project/[id]/${segment}/page.tsx`;
}

export function validateWorkspaceNav(
  pageExists: (relativePath: string) => boolean,
): NavCoherenceCheck[] {
  return allWorkspaceNavHrefs().map((route) => ({
    route,
    ok: pageExists(workspaceHrefToAppPath(route)),
    sprint: E5_ECOSYSTEM_ROUTES.includes(route) ? "E5" : "E5",
  }));
}

export function validateProjectNav(
  pageExists: (relativePath: string) => boolean,
): NavCoherenceCheck[] {
  return allProjectNavSegments().map((segment) => ({
    route: segment ? `/project/[id]/${segment}` : "/project/[id]",
    ok: segment
      ? pageExists(projectSegmentToAppPath(segment))
      : pageExists("src/app/project/[id]/page.tsx"),
    sprint: (E5_PROJECT_SEGMENTS as readonly string[]).includes(segment) ? "E5" : "E5",
  }));
}

export function runNavCoherenceSmokeTest(input: {
  workspaceChecks: NavCoherenceCheck[];
  projectChecks: NavCoherenceCheck[];
}): {
  ok: boolean;
  ecosystemLinked: number;
  projectOutcomesLinked: number;
  missingCount: number;
} {
  const missing = [...input.workspaceChecks, ...input.projectChecks].filter((c) => !c.ok);
  const ecosystemLinked = input.workspaceChecks.filter(
    (c) => E5_ECOSYSTEM_ROUTES.includes(c.route) && c.ok,
  ).length;
  const projectOutcomesLinked = input.projectChecks.filter(
    (c) =>
      (E5_PROJECT_SEGMENTS as readonly string[]).some((seg) => c.route.includes(`/${seg}`)) &&
      c.ok,
  ).length;

  return {
    ok: missing.length === 0,
    ecosystemLinked,
    projectOutcomesLinked,
    missingCount: missing.length,
  };
}

export function runNavCoherenceEngineSmokeTest(): {
  ok: boolean;
  ecosystemRouteCount: number;
  intelligenceRouteCount: number;
} {
  return {
    ok:
      workspaceEcosystemNav.length >= 7 &&
      workspaceIntelligenceNav.every((item) => item.href.startsWith("/workspace/")),
    ecosystemRouteCount: workspaceEcosystemNav.length,
    intelligenceRouteCount: workspaceIntelligenceNav.length,
  };
}
