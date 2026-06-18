import { Users } from "lucide-react";
import { listStakeholders } from "@/services/traceability";
import { listStakeholderShareLinks } from "@/services/stakeholderShare";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StakeholderMap } from "@/components/traceability/stakeholder-map";
import { StakeholderForm } from "./stakeholder-form";
import { DeleteStakeholderButton } from "./delete-stakeholder-button";
import { StakeholderSharePanel } from "@/components/stakeholder/stakeholder-share-panel";

type Params = Promise<{ id: string }>;

const SENTIMENT_LABEL: Record<string, string> = {
  champion: "Champion",
  neutral: "Neutral",
  skeptic: "Skeptic",
  blocker: "Blocker",
};

export default async function ProjectStakeholdersPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [stakeholders, shareLinks] = await Promise.all([
    listStakeholders(id),
    listStakeholderShareLinks(id).catch(() => []),
  ]);

  return (
    <main className="p-6">
      <PageHeader
        title="Stakeholders"
        description="Map influence, interest, and sentiment for delivery traceability."
        icon={Users}
      />

      <div className="mb-8">
        <StakeholderSharePanel projectId={id} links={shareLinks} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <StakeholderMap stakeholders={stakeholders} />

          {stakeholders.length === 0 ? (
            <EmptyState
              title="No stakeholders yet"
              description="Add sponsors, partners, and key contacts."
            />
          ) : (
            <div className="space-y-3">
              {stakeholders.map((s) => (
                <article
                  key={s.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <h2 className="font-semibold">{s.name}</h2>
                    <p className="text-xs text-slate-500">
                      {[s.role_label, s.organisation_name].filter(Boolean).join(" · ") ||
                        "No role set"}
                    </p>
                    {s.email ? (
                      <p className="mt-1 text-xs text-slate-500">{s.email}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                        Influence: {s.influence}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                        Interest: {s.interest}
                      </span>
                      <span className="rounded bg-[#0F766E]/10 px-2 py-0.5 text-[#0F766E]">
                        {SENTIMENT_LABEL[s.sentiment] ?? s.sentiment}
                      </span>
                    </div>
                    {s.notes ? (
                      <p className="mt-2 text-sm text-slate-600">{s.notes}</p>
                    ) : null}
                  </div>
                  <DeleteStakeholderButton projectId={id} stakeholderId={s.id} />
                </article>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Add stakeholder</h2>
          <StakeholderForm projectId={id} />
        </div>
      </div>
    </main>
  );
}
