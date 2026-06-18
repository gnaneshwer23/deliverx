import Link from "next/link";
import { Bot, ArrowRightLeft } from "lucide-react";
import type { AgentActivityEventRow } from "@/services/agentOrchestration";
import { dxClass } from "@/lib/dx-theme";

const ROLE_LABEL: Record<string, string> = {
  chief_of_staff: "Chief of Staff",
  pm_agent: "PM Agent",
  ba_agent: "BA Agent",
  product_agent: "Product Agent",
  engineer_agent: "Engineer Agent",
  qa_agent: "QA Agent",
  scrum_agent: "Scrum Agent",
  founder_agent: "Founder Agent",
};

const EVENT_STYLE: Record<string, string> = {
  route: "border-l-violet-500 bg-violet-50/40",
  insight: "border-l-teal-600 bg-teal-50/30",
  handoff: "border-l-amber-500 bg-amber-50/40",
  synthesis: "border-l-[#1C4A2E] bg-[#EEF5F1]",
};

export function CommandCentreAgentFeed({
  events,
}: {
  events: AgentActivityEventRow[];
}) {
  return (
    <section className={`${dxClass.cardPad}`}>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-md bg-violet-100 text-violet-700">
          <Bot size={14} />
        </span>
        <h3 className="font-semibold">Agent activity</h3>
        <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-wide text-[#A8A89E]">
          Chief of Staff → 7 specialists
        </span>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-[#6B6B64]">
          No agent runs yet. Use &ldquo;Run agent sweep&rdquo; to orchestrate specialists across
          active projects.
        </p>
      ) : (
        <ul className="space-y-2">
          {events.slice(0, 10).map((event) => (
            <li
              key={event.id}
              className={`rounded-md border-l-4 px-3 py-2 text-sm ${EVENT_STYLE[event.eventType] ?? "border-l-[#E4E4DC] bg-white"}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-[#0D0D0B]">
                  {ROLE_LABEL[event.agentRole] ?? event.agentRole}
                </p>
                <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
                  {event.eventType}
                </span>
              </div>
              <p className="mt-1 text-[#2C2C28]">{event.message}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#6B6B64]">
                <Link href={`/project/${event.projectId}`} className="hover:text-[#1C4A2E]">
                  {event.projectName}
                </Link>
                {event.handoffTo ? (
                  <span className="inline-flex items-center gap-1">
                    <ArrowRightLeft size={10} />
                    → {ROLE_LABEL[event.handoffTo] ?? event.handoffTo}
                  </span>
                ) : null}
                {event.ragSourceCount > 0 ? (
                  <span>{event.ragSourceCount} RAG sources</span>
                ) : null}
                <span>{new Date(event.createdAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
