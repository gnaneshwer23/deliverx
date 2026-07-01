import Link from "next/link";
import { BookOpen } from "lucide-react";
import { listPlaybooks, type PlaybookRow } from "@/services/memory";
import { getCurrentOrganisationProfile } from "@/services/organisationProfile";
import { AiConfigBanner } from "@/components/ai/ai-config-banner";
import { ProjectForm } from "./project-form";
import { dxClass } from "@/lib/dx-theme";

type Search = Promise<{ playbook?: string; mode?: string }>;

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { playbook: selectedId, mode } = await searchParams;
  const initialMode = mode === "chat" ? "chat" : "form";
  const [playbooks, orgProfile] = await Promise.all([
    safeListPlaybooks(),
    getCurrentOrganisationProfile().catch(() => ({ industry: null, deliveryType: null })),
  ]);
  const selected = playbooks.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:py-14">
      <h1 className={`${dxClass.display} text-2xl md:text-3xl`}>Name your first delivery project</h1>
      <p className="mt-2 text-[15px] font-light text-[#6B7280]">
        Sponsors and delivery leads: capture your initiative, submit a Brief v2 business case, and
        pass the AI Review Queue with human approval. Then invite your team into seven persona
        workspaces.
      </p>
      {initialMode !== "chat" ? (
        <p className="mt-3 text-sm text-[#6B6B64]">
          Prefer to talk it through instead?{" "}
          <Link href="/project/new?mode=chat" className="font-medium text-[#1C4A2E] hover:underline">
            Start guided setup →
          </Link>
        </p>
      ) : null}

      {playbooks.length > 0 ? (
        <section className={`${dxClass.cardPad} mt-8`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen size={14} className="text-[#1C4A2E]" /> Start from a playbook
            </h2>
            <span className="font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
              Optional
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {playbooks.slice(0, 4).map((pb) => {
              const active = pb.id === selected?.id;
              return (
                <Link
                  key={pb.id}
                  href={`/project/new?playbook=${encodeURIComponent(pb.id)}`}
                  className={`border p-3 text-left transition ${
                    active
                      ? "border-[#1C4A2E] bg-[#EEF5F1]"
                      : "border-[#E4E4DC] hover:border-[#1C4A2E]/40"
                  }`}
                >
                  <p className="text-sm font-medium">{pb.name}</p>
                  <p className="mt-1 text-xs text-[#6B6B64]">
                    {[pb.industry, pb.delivery_type].filter(Boolean).join(" · ") || "Generic"}
                  </p>
                </Link>
              );
            })}
          </div>

          {selected ? (
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-[#6B6B64]">
                Selected: <span className="font-medium text-[#0D0D0B]">{selected.name}</span>
              </span>
              <Link href="/project/new" className="text-[#6B6B64] hover:text-[#1C4A2E]">
                Clear
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className={`${dxClass.cardPad} mt-6`}>
        <AiConfigBanner />
        <ProjectForm
          playbookId={selected?.id}
          deliveryTypeDefault={selected?.delivery_type ?? orgProfile.deliveryType ?? undefined}
          initialMode={initialMode}
          orgIndustry={orgProfile.industry}
          orgDeliveryType={orgProfile.deliveryType}
        />
      </div>
    </div>
  );
}

async function safeListPlaybooks(): Promise<PlaybookRow[]> {
  try {
    return await listPlaybooks();
  } catch {
    return [];
  }
}
