import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import {
  resolveDefaultPortfolio,
  getPortfolioSnapshot,
} from "@/services/portfolio";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { ProgrammeCard } from "@/components/portfolio/programme-card";
import { ExecutiveSummary } from "@/components/portfolio/executive-summary";
import { PortfolioCreateForm } from "./create-form";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const portfolio = await resolveDefaultPortfolio();

  if (!portfolio) {
    return (
      <main className="p-8">
        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Briefcase size={20} className="text-indigo-600" /> Portfolio
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organisation-level delivery intelligence.
          </p>
        </header>
        <PortfolioCreateForm />
      </main>
    );
  }

  const { snapshot, programmes } = await getPortfolioSnapshot(portfolio.id);

  return (
    <main className="p-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Briefcase size={20} className="text-indigo-600" /> {portfolio.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Programmes, projects, dependencies, and risks rolled up to the
            portfolio level.
          </p>
        </div>
        <Link
          href="/workspace/programmes"
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
        >
          New programme <ArrowRight size={14} />
        </Link>
      </header>

      <PortfolioSummary snapshot={snapshot} />

      <div className="mt-8">
        <ExecutiveSummary summary={snapshot.executiveSummary} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Programmes</h2>
        {programmes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            <p className="font-medium text-slate-700">No programmes yet.</p>
            <p className="mt-1">
              Create a programme to start grouping related projects.
            </p>
            <Link
              href="/workspace/programmes"
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
            >
              New programme
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((p) => (
              <ProgrammeCard key={p.id} programme={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
