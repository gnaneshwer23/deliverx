import Link from "next/link";
import type { ReactNode } from "react";
import {
  WorkspacePageHeader,
  WorkspaceProductShell,
} from "@/components/professional-workspace/workspace-product-shell";

export function OrgListPage({
  breadcrumb,
  title,
  titleEm,
  lead,
  stats,
  children,
  empty,
}: {
  breadcrumb: string;
  title: string;
  titleEm?: string;
  lead?: string;
  stats?: Array<{
    label: string;
    value: string | number;
    tone?: "green" | "amber" | "red" | "default";
  }>;
  children: ReactNode;
  empty?: { title: string; description: string; href?: string; actionLabel?: string };
}) {
  const heading = titleEm ? `${title} ${titleEm}` : title;

  return (
    <WorkspaceProductShell>
      <WorkspacePageHeader
        eyebrow={breadcrumb}
        title={heading}
        lead={lead}
      />

      {stats && stats.length > 0 ? (
        <div className="pw-stats" aria-label="Counts — not health scores">
          {stats.map((s) => (
            <div key={s.label} className="pw-stat">
              <span>{s.label}</span>
              <strong>{s.value}</strong>
            </div>
          ))}
        </div>
      ) : null}

      {empty ? (
        <div className="pw-empty" role="status">
          <strong>{empty.title}</strong>
          {empty.description}
          {empty.href && empty.actionLabel ? (
            <div className="pw-main-actions" style={{ marginTop: 16 }}>
              <Link href={empty.href} className="pw-button">
                {empty.actionLabel}
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        children
      )}
    </WorkspaceProductShell>
  );
}

export function OrgListTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="pw-table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>
              {cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function projectLink(projectId: string, name: string) {
  return (
    <Link href={`/project/${projectId}`} style={{ fontWeight: 600, color: "var(--pw-accent)" }}>
      {name}
    </Link>
  );
}
