"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { brandClass } from "@/lib/brand";

type Item = { label: string; href: string; soon?: boolean };

export function ProjectSidebar({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const pathname = usePathname();

  const items: Item[] = [
    { label: "Overview", href: `/project/${projectId}` },
    { label: "Projects", href: "/workspace/dashboard" },
    { label: "Workstreams", href: `/project/${projectId}/workstreams`, soon: true },
    { label: "Tasks", href: `/project/${projectId}/tasks`, soon: true },
    { label: "Meetings", href: `/project/${projectId}/meetings`, soon: true },
    { label: "RAID", href: `/project/${projectId}/raid`, soon: true },
    { label: "Reports", href: `/project/${projectId}/reports`, soon: true },
  ];

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r bg-white p-6 md:flex">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight">
          DeliverX
        </Link>
        <Link
          href="/project/new"
          className={`rounded-md p-1 text-slate-500 hover:bg-slate-100 ${brandClass.textHover}`}
          title="New project"
        >
          <Plus size={16} />
        </Link>
      </div>

      <div className="mb-3 text-xs uppercase tracking-wide text-slate-400">
        Project
      </div>
      <div className="mb-6 truncate text-sm font-semibold" title={projectName}>
        {projectName}
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.soon ? "#" : item.href}
              aria-disabled={item.soon}
              className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                active
                  ? brandClass.activeNav
                  : item.soon
                    ? "text-slate-400"
                    : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{item.label}</span>
              {item.soon ? (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                  Soon
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs">
          <p className="mb-2 font-semibold">Project Health</p>
          <p className="text-slate-500">Delivery stable</p>
        </div>
      </div>
    </aside>
  );
}
