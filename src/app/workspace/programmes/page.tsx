import Link from "next/link";
import { Layers } from "lucide-react";
import {
  resolveDefaultPortfolio,
  getPortfolioSnapshot,
} from "@/services/portfolio";
import { ProgrammeCard } from "@/components/portfolio/programme-card";
import { ProgrammeCreateForm } from "./create-form";

export const dynamic = "force-dynamic";

export default async function ProgrammesPage() {
  const portfolio = await resolveDefaultPortfolio();

  if (!portfolio) {
    return (
      <main className="p-8">
        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Layers size={20} className="text-indigo-600" /> Programmes
          </h1>
        </header>
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">No portfolio yet.</p>
          <p className="mt-1">Set up your portfolio before creating programmes.</p>
          <Link
            href="/workspace/portfolio"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Go to portfolio
          </Link>
        </div>
      </main>
    );
  }

  const { programmes } = await getPortfolioSnapshot(portfolio.id);

  return (
    <main className="p-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Layers size={20} className="text-indigo-600" /> Programmes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Group related projects under a strategic goal.
          </p>
        </div>
        <ProgrammeCreateForm portfolioId={portfolio.id} />
      </header>

      {programmes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">No programmes yet.</p>
          <p className="mt-1">
            Create your first programme to start coordinating projects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p) => (
            <ProgrammeCard key={p.id} programme={p} />
          ))}
        </div>
      )}
    </main>
  );
}
