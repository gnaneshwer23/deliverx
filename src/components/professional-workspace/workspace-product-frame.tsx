"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { professionalWorkspaceNav } from "@/config/professional-workspace-nav";
import {
  encodeWorkspaceProjectParam,
  type WorkspaceProjectRef,
  withProjectQuery,
} from "@/lib/professional-workspace/project-context";
import "./workspace-app.css";

const PRIMARY_RAIL_HREFS = new Set([
  "/workspace",
  "/workspace/team",
  "/workspace/meetings",
  "/workspace/tasks",
  "/workspace/artefacts",
  "/workspace/decisions",
  "/workspace/risks",
  "/workspace/evidence",
  "/workspace/projects",
  "/workspace/search",
]);

export function WorkspaceProductFrame({
  project = null,
  children,
  aside,
  showRail = true,
}: {
  project?: WorkspaceProjectRef | null;
  children: ReactNode;
  aside?: ReactNode;
  showRail?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectParam =
    project != null
      ? encodeWorkspaceProjectParam(project)
      : searchParams.get("project");

  const railItems = [
    { href: "/workspace", label: "Overview", id: "pw-overview" },
    ...professionalWorkspaceNav.filter((item) => PRIMARY_RAIL_HREFS.has(item.href)),
    { href: "/workspace/projects", label: "Projects", id: "pw-projects" },
    { href: "/workspace/search", label: "Search", id: "pw-search" },
  ];

  // Deduplicate by href (overview may appear twice from modules)
  const seen = new Set<string>();
  const nav = railItems.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });

  function hrefFor(base: string) {
    if (project) return withProjectQuery(base, project);
    if (projectParam && base !== "/workspace/search") {
      return `${base}?project=${encodeURIComponent(projectParam)}`;
    }
    return base;
  }

  function isActive(href: string) {
    if (href === "/workspace") return pathname === "/workspace";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="pw-root">
      <div className={showRail ? "pw-shell" : undefined}>
        {showRail ? (
          <aside className="pw-rail" aria-label="Workspace modules">
            <div className="pw-rail-brand">
              Professional Workspace
              <span>Team Copilot alias · not a separate SKU</span>
            </div>
            <nav>
              {nav.map((item) => (
                <Link
                  key={item.id}
                  href={hrefFor(item.href)}
                  className={isActive(item.href) ? "is-active" : undefined}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="pw-rail-footer">
              <Link href="/settings/profile">Observation settings</Link>
              <Link href="/help">Help</Link>
              <Link href="/profile/evidence">Evidence Ledger</Link>
            </div>
          </aside>
        ) : null}

        <div className="pw-main">
          {aside ? (
            <div className="pw-body-grid">
              <div className="pw-content">{children}</div>
              <aside className="pw-aside" aria-label="Workspace context">
                {aside}
              </aside>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkspacePageHeader({
  eyebrow = "Professional Workspace",
  title,
  lead,
  actions,
  context,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
  context?: ReactNode;
}) {
  return (
    <header className="pw-main-header">
      <div>
        <p className="pw-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {lead ? <p className="pw-lead">{lead}</p> : null}
        {actions ? <div className="pw-main-actions" style={{ marginTop: 16 }}>{actions}</div> : null}
      </div>
      {context}
    </header>
  );
}
