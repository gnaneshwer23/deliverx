import Link from "next/link";
import {
  BarChart3,
  Users,
  Layers,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AiInsights } from "./ai-insights";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: activeProjects } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .in("status", ["draft", "active"]);

  const kpis = [
    {
      title: "Active Projects",
      value: String(activeProjects ?? 0),
      icon: Layers,
      live: true,
    },
    { title: "Tasks In Progress", value: "—", icon: BarChart3, live: false },
    { title: "Team Members", value: "—", icon: Users, live: false },
    { title: "Open Risks", value: "—", icon: AlertTriangle, live: false },
  ];

  return (
    <main className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Overview</h1>
          <p className="text-sm text-slate-500">Operational delivery dashboard</p>
        </div>
        <Link
          href="/project/new"
          className="inline-flex h-9 items-center justify-center rounded-md bg-[#0F766E] px-4 text-sm font-medium text-white hover:bg-[#0E6B62]"
        >
          New Project
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-500">{card.title}</p>
                    {card.live ? null : (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                </div>
                <div className="text-[#0F766E]">
                  <Icon size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashboardCard className="lg:col-span-2" title="Delivery Performance">
          <div className="flex h-40 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
            Chart Placeholder
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Activity">
          <ul className="space-y-3 text-sm text-slate-600">
            <li>Task updated: Data migration</li>
            <li>New risk logged: Vendor delay</li>
            <li>Milestone reached: Phase 1 complete</li>
          </ul>
        </DashboardCard>

        <DashboardCard className="lg:col-span-2" title="Active Tasks">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2 font-medium">Task</th>
                  <th className="pb-2 font-medium">Workstream</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-3">System integration</td>
                    <td>Infrastructure</td>
                    <td className="text-blue-500">In Progress</td>
                    <td>High</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <DashboardCard title="Risk Register">
          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              Vendor delivery delays
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-yellow-700">
              Resource constraints
            </div>
          </div>
        </DashboardCard>
      </div>

      <AiInsights />

      <div className="mt-8 flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500">
        <span>
          Demo data shown for non-live tiles. Live: Active Projects. Wire-up
          continues in Day 5+.
        </span>
        <Link
          href="/project/new"
          className="inline-flex items-center gap-1 text-[#0F766E] hover:underline"
        >
          Add a project <ArrowUpRight size={14} />
        </Link>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className ?? ""}`}
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}
