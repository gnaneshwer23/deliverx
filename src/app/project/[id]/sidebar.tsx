"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { brandClass } from "@/lib/brand";

type NavItem = { label: string; href: string };

type NavSection = {
  label: string;
  items: NavItem[];
};

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href.endsWith("/tasks") && pathname.startsWith(`${href}/`)) return true;
  if (href.endsWith("/reports") && pathname.startsWith(`${href}/`)) return true;
  if (href.includes("/charter") && pathname.startsWith(href)) return true;
  if (href.includes("/standups") && pathname.startsWith(href)) return true;
  if (href.includes("/stakeholders") && pathname.startsWith(href)) return true;
  if (href.includes("/traceability") && pathname.startsWith(href)) return true;
  if (href.includes("/meetings") && pathname.startsWith(href)) return true;
  if (href.includes("/workstreams") && pathname.startsWith(href)) return true;
  return false;
}

export function ProjectSidebar({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      label: "Project",
      items: [
        { label: "Overview", href: `/project/${projectId}` },
        { label: "Charter", href: `/project/${projectId}/charter` },
      ],
    },
    {
      label: "Delivery",
      items: [
        { label: "Workstreams", href: `/project/${projectId}/workstreams` },
        { label: "Tasks", href: `/project/${projectId}/tasks` },
        { label: "Meetings", href: `/project/${projectId}/meetings` },
        { label: "Standups", href: `/project/${projectId}/standups` },
      ],
    },
    {
      label: "Governance",
      items: [
        { label: "RAID", href: `/project/${projectId}/raid` },
        { label: "Decisions", href: `/project/${projectId}/decisions` },
        { label: "Documents", href: `/project/${projectId}/documents` },
        { label: "Changes", href: `/project/${projectId}/changes` },
        { label: "Reports", href: `/project/${projectId}/reports` },
      ],
    },
    {
      label: "People & trace",
      items: [
        { label: "Stakeholders", href: `/project/${projectId}/stakeholders` },
        { label: "Traceability", href: `/project/${projectId}/traceability` },
      ],
    },
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

      <div className="mb-6 truncate text-sm font-semibold" title={projectName}>
        {projectName}
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        {sections.map((section) => (
          <div key={section.label}>
            <div className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 first:mt-0">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2 transition ${
                    active
                      ? brandClass.activeNav
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-3 pt-6">
        <Link
          href="/workspace/projects"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-[#0F766E]"
        >
          <ArrowLeft size={14} />
          All projects
        </Link>
      </div>
    </aside>
  );
}
