import { BookOpen } from "lucide-react";
import { listPlaybooks } from "@/services/memory";
import { listOrgProjects } from "@/services/delivery";
import { PlaybookApplyMenu } from "./playbook-apply-menu";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { DxButtonLink } from "@/components/dx/dx-button";
import { dxClass } from "@/lib/dx-theme";

export default async function PlaybooksPage() {
  const [playbooks, projects] = await Promise.all([listPlaybooks(), listOrgProjects()]);

  return (
    <>
      <DxPageHeader breadcrumb="DeliverX · Memory" title="Delivery" titleEm="playbooks" />
      <div className="p-6 md:p-8">
        {playbooks.length === 0 ? (
          <div className={`${dxClass.cardPad} text-center`}>
            <p className={`${dxClass.display} text-lg`}>No playbooks generated yet</p>
            <p className="mt-2 text-sm text-[#6B6B64]">
              Closing a project generates a playbook automatically from delivery patterns.
            </p>
            <DxButtonLink href="/workspace/dashboard" className="mt-5 inline-flex text-[10px]">
              Go to projects
            </DxButtonLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playbooks.map((p) => (
              <article key={p.id} className={`${dxClass.cardPad} flex flex-col`}>
                <div>
                  <h3 className="flex items-center gap-2 font-semibold tracking-tight">
                    <BookOpen size={16} className="text-[#1C4A2E]" />
                    {p.name}
                  </h3>
                  <p className="mt-1 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase text-[#A8A89E]">
                    {[p.industry, p.delivery_type].filter(Boolean).join(" · ") || "Generic"}
                  </p>
                </div>
                <p className="mt-3 text-sm text-[#6B6B64]">{p.description}</p>

                {p.structure?.workstreams?.length ? (
                  <div className="mt-4">
                    <div className={dxClass.label}>Workstreams</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.structure.workstreams.map((w) => (
                        <span
                          key={w}
                          className="bg-[#F7F7F2] px-1.5 py-0.5 text-[10px] text-[#6B6B64]"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-auto pt-4">
                  <PlaybookApplyMenu playbookId={p.id} projects={projects} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
