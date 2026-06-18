import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { FeedCard, FeedCardList } from "@/components/dx/feed-card";
import { formatAuditTimeline } from "@/lib/approval/audit-timeline";
import type { AuditEventWithContext } from "@/services/auditEvents";

export function AuditTrailTimeline({
  events,
  showProject = true,
  emptyMessage = "No audit events yet — AI suggestions and human decisions will appear here.",
}: {
  events: AuditEventWithContext[];
  showProject?: boolean;
  emptyMessage?: string;
}) {
  const items = formatAuditTimeline(events);

  if (items.length === 0) {
    return <FeedCardList emptyMessage={emptyMessage} isEmpty />;
  }

  return (
    <FeedCardList
      title="Audit timeline"
      icon={<ClipboardList size={14} className="text-[#1C4A2E]" />}
    >
      {items.map((item) => (
        <FeedCard
          key={item.id}
          severity={item.severity}
          badge={item.eventLabel}
          badgeClassName={item.badgeClassName}
          meta={item.entityLabel}
          title={
            showProject && item.projectLabel ? (
              <>
                {item.title}
                <span className="mt-1 block text-xs text-[#6B6B64]">
                  {item.projectLabel} · {item.actorLabel}
                </span>
              </>
            ) : (
              <>
                {item.title}
                <span className="mt-1 block text-xs text-[#6B6B64]">{item.actorLabel}</span>
              </>
            )
          }
          timestamp={new Date(item.timestamp).toLocaleString()}
        />
      ))}
    </FeedCardList>
  );
}

export function AuditProjectFilter({
  projects,
  currentProjectId,
}: {
  projects: Array<{ id: string; name: string }>;
  currentProjectId?: string | null;
}) {
  if (projects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/workspace/audit"
        className={`rounded-full border px-3 py-1 text-xs font-medium ${
          !currentProjectId
            ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
            : "border-[#E4E4DC] text-[#6B6B64] hover:border-[#A8A89E]"
        }`}
      >
        All projects
      </Link>
      {projects.slice(0, 12).map((project) => (
        <Link
          key={project.id}
          href={`/workspace/audit?project=${project.id}`}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            currentProjectId === project.id
              ? "border-[#1C4A2E] bg-[#EEF5F1] text-[#1C4A2E]"
              : "border-[#E4E4DC] text-[#6B6B64] hover:border-[#A8A89E]"
          }`}
        >
          {project.name}
        </Link>
      ))}
    </div>
  );
}
