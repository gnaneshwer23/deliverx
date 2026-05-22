import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTodayStandup, listStandups } from "@/services/traceability";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StandupForm } from "./standup-form";

type Params = Promise<{ id: string }>;

export default async function ProjectStandupsPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [todayStandup, standups] = await Promise.all([
    getTodayStandup(id),
    listStandups(id, { days: 14 }),
  ]);

  const supabase = await createClient();
  const userIds = [...new Set(standups.map((s) => s.user_id))];
  const { data: users } =
    userIds.length > 0
      ? await supabase.from("users").select("id, name, email").in("id", userIds)
      : { data: [] };
  const userMap = Object.fromEntries(
    (users ?? []).map((u) => [u.id, u.name ?? u.email ?? "Team member"]),
  );

  return (
    <main className="p-6">
      <PageHeader
        title="Standups"
        description="Daily updates feed delivery intelligence and team visibility."
        icon={MessageSquare}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {standups.length === 0 ? (
            <EmptyState
              title="No standups yet"
              description="Submit today's update to start the cadence."
            />
          ) : (
            standups.map((s) => (
              <article
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{userMap[s.user_id] ?? "Team member"}</p>
                  <time className="text-xs text-slate-500">
                    {new Date(s.standup_date).toLocaleDateString()}
                  </time>
                </div>
                {s.yesterday ? (
                  <div className="mt-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Yesterday</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{s.yesterday}</p>
                  </div>
                ) : null}
                <div className="mt-3">
                  <p className="text-[10px] font-semibold uppercase text-slate-400">Today</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{s.today}</p>
                </div>
                {s.blockers ? (
                  <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase text-amber-700">Blockers</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900">{s.blockers}</p>
                  </div>
                ) : null}
              </article>
            ))
          )}
        </div>

        <div>
          <StandupForm projectId={id} existing={todayStandup} />
          <p className="mt-4 text-xs text-slate-500">
            Org-wide feed on{" "}
            <Link href="/workspace/standups" className="font-medium text-[#0F766E] hover:underline">
              workspace standups
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
