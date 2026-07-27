import Link from "next/link";
import { Store } from "lucide-react";
import { listMarketplaceAssets } from "@/services/coordination";
import { listInstalledAssetIds, listMarketplaceInstalls } from "@/services/marketplace";
import { DemotedWorkspaceBanner } from "@/components/dx/demoted-workspace-banner";
import { ShareAssetForm } from "./share-form";
import { InstallMarketplaceButton } from "./install-button";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  playbook: "Playbook",
  governance_template: "Governance template",
  risk_library: "Risk library",
  delivery_framework: "Delivery framework",
};

export default async function MarketplacePage() {
  const [assets, installedIds, recentInstalls] = await Promise.all([
    listMarketplaceAssets(),
    listInstalledAssetIds(),
    listMarketplaceInstalls(6),
  ]);

  return (
    <main className="p-8">
      <DemotedWorkspaceBanner
        title="Marketplace is outside the primary pilot journey"
        body="Employer / ecosystem marketplace liquidity is charter-deferred. This page stays bookmarkable for org playbook sharing only — it is not a hiring marketplace."
      />
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Store size={22} className="text-[#0F766E]" aria-hidden /> Marketplace
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Share playbooks, governance templates, risk libraries, and delivery
          frameworks — install public assets into your org playbook library.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
              <p className="font-medium text-slate-700">No assets yet</p>
              <p className="mt-1">
                Honest empty state — there is no seeded marketplace inventory.
                Share a playbook or framework only if your org needs internal
                reuse; employer liquidity is out of charter.
              </p>
              <Link
                href="/profile"
                className="mt-4 inline-flex min-h-11 items-center justify-center text-sm font-medium text-[#1C4A2E] underline-offset-2 hover:underline"
              >
                Back to Professional Home
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {assets.map((a) => (
                <article
                  key={a.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-teal-700">
                    {TYPE_LABEL[a.asset_type] ?? a.asset_type}
                  </span>
                  {a.is_public ? (
                    <span className="ml-2 rounded bg-violet-50 px-2 py-0.5 text-xs font-semibold uppercase text-violet-700">
                      Public
                    </span>
                  ) : null}
                  <h2 className="mt-2 text-base font-semibold text-slate-800">
                    {a.title}
                  </h2>
                  {a.description ? (
                    <p className="mt-1 text-sm text-slate-500">{a.description}</p>
                  ) : null}
                  <p className="mt-3 text-xs text-slate-400">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                  <InstallMarketplaceButton
                    assetId={a.id}
                    installed={installedIds.has(a.id)}
                  />
                </article>
              ))}
            </div>
          )}

          {recentInstalls.length > 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-800">Recent installs</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {recentInstalls.map((install) => (
                  <li
                    key={install.id}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span>
                      {install.assetTitle}{" "}
                      <span className="text-xs text-slate-400">
                        ({TYPE_LABEL[install.assetType] ?? install.assetType})
                      </span>
                    </span>
                    <Link
                      href="/workspace/playbooks"
                      className="inline-flex min-h-11 items-center text-xs font-medium text-teal-700 hover:underline"
                    >
                      View playbooks
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <ShareAssetForm />
      </div>
    </main>
  );
}
