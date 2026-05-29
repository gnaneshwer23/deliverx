import Link from "next/link";
import { getOrgCapacitySnapshot } from "@/services/capacity";
import { DxPageHeader, DxStatCard } from "@/components/dx/dx-page-chrome";
import { dxClass } from "@/lib/dx-theme";
import { RebalanceButton } from "./rebalance-button";

export const dynamic = "force-dynamic";

export default async function CapacityPage() {
  const snap = await getOrgCapacitySnapshot();

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX OS · Intelligence" title="Resource" titleEm="capacity" />
      <div className="p-6 md:p-8">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DxStatCard label="Avg open tasks / member" value={snap.avgLoad} />
          <DxStatCard
            label="Overloaded members"
            value={snap.overloadedCount}
            tone={snap.overloadedCount ? "amber" : "green"}
          />
          <DxStatCard
            label="Delivery strain"
            value={snap.deliveryStrain}
            tone={snap.deliveryStrain === "high" ? "red" : snap.deliveryStrain === "medium" ? "amber" : "green"}
          />
          <DxStatCard label="Rebalance suggestions" value={snap.suggestions.length} />
        </div>

        <section className={`${dxClass.cardPad} mb-6`}>
          <h2 className={`${dxClass.display} mb-4 text-lg`}>Team workload</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E4E4DC] bg-[#F7F7F2]">
                  {["Member", "Open", "Blocked", "Critical", "Status"].map((h) => (
                    <th key={h} className="px-3 py-2 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#6B6B64]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snap.members.map((m) => (
                  <tr key={m.userId} className="border-b border-[#F0F0E8]">
                    <td className="px-3 py-2">{m.name}</td>
                    <td className="px-3 py-2">{m.openTasks}</td>
                    <td className="px-3 py-2">{m.blockedTasks}</td>
                    <td className="px-3 py-2">{m.criticalTasks}</td>
                    <td className="px-3 py-2">{m.overload ? "Overload" : "OK"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {snap.suggestions.length > 0 ? (
          <section className={`${dxClass.cardPad}`}>
            <h2 className={`${dxClass.display} mb-3 text-lg`}>Rebalance suggestions</h2>
            <ul className="space-y-2 text-sm">
              {snap.suggestions.map((s) => (
                <li key={s.id} className="border border-[#E4E4DC] bg-[#F7F7F2] p-3">
                  Move ~{s.taskCount} tasks from <strong>{s.fromName}</strong> →{" "}
                  <strong>{s.toName}</strong>
                  <p className="mt-1 text-xs text-[#6B6B64]">{s.reason}</p>
                  <RebalanceButton suggestion={s} />
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-[#A8A89E]">
              You can also adjust assignments in{" "}
              <Link href="/workspace/tasks" className="text-[#1C4A2E] underline">
                tasks
              </Link>
              .
            </p>
          </section>
        ) : null}
      </div>
    </>
  );
}
