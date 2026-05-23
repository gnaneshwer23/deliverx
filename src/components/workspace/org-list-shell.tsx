import Link from "next/link";
import type { ReactNode } from "react";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { DxStatCard } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";

export function OrgListPage({
  breadcrumb,
  title,
  titleEm,
  stats,
  children,
  empty,
}: {
  breadcrumb: string;
  title: string;
  titleEm?: string;
  stats?: Array<{ label: string; value: string | number; tone?: "green" | "amber" | "red" | "default" }>;
  children: ReactNode;
  empty?: { title: string; description: string; href?: string; actionLabel?: string };
}) {
  return (
    <>
      <DxPageHeader breadcrumb={breadcrumb} title={title} titleEm={titleEm} />
      <div className="p-6 md:p-8">
        {stats && stats.length > 0 ? (
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <DxStatCard key={s.label} label={s.label} value={s.value} tone={s.tone} />
            ))}
          </div>
        ) : null}
        {empty ? (
          <div className={`${dxClass.cardPad} text-center`}>
            <p className={`${dxClass.display} text-lg`}>{empty.title}</p>
            <p className="mt-2 text-sm text-[#6B6B64]">{empty.description}</p>
            {empty.href && empty.actionLabel ? (
              <Link
                href={empty.href}
                className={`${dxClass.btnPrimary} mt-5 inline-flex text-[10px]`}
              >
                {empty.actionLabel}
              </Link>
            ) : null}
          </div>
        ) : (
          children
        )}
      </div>
    </>
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
    <div className={`${dxClass.card} overflow-x-auto`}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[#E4E4DC] bg-[#F7F7F2]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.12em] text-[#6B6B64]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-[#F0F0E8] last:border-0">
              {cells.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[#0D0D0B]">
                  {cell}
                </td>
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
    <Link href={`/project/${projectId}`} className="font-medium text-[#1C4A2E] hover:underline">
      {name}
    </Link>
  );
}
