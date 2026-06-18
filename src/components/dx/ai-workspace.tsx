"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { AiChatCore } from "@/components/dx/ai-chat-core";
import { DxCaps } from "@/components/dx/dx-logo";
import { dxClass } from "@/lib/dx-theme";

export function AiWorkspace({
  projects,
}: {
  projects: Array<{ id: string; name: string }>;
}) {
  return (
    <div className="grid h-[calc(100vh-var(--dx-navh))] grid-cols-1 overflow-hidden lg:grid-cols-[210px_1fr_290px]">
      <aside className="hidden border-r border-[#E4E4DC] bg-white lg:flex lg:flex-col">
        <div className="border-b border-[#E4E4DC] p-3">
          <DxCaps className="mb-2 block">AI Workspaces</DxCaps>
          <Link
            href="/project/new?mode=chat"
            className={`${dxClass.btnSm} w-full justify-center text-[8px]`}
          >
            <Plus size={12} /> New programme (guided)
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5">
          <DxCaps className="px-2 py-1.5 text-[7px]">Recent</DxCaps>
          {projects.length === 0 ? (
            <div className="space-y-2 px-3 py-2">
              <p className="text-xs text-[#A8A89E]">No projects yet.</p>
              <Link
                href="/project/new?mode=chat"
                className="block text-xs font-medium text-[#1C4A2E] underline"
              >
                Start guided questionnaire →
              </Link>
            </div>
          ) : (
            projects.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className="w-full border-t-2 border-transparent px-3 py-2.5 text-left hover:bg-[#F7F7F2]"
              >
                <DxCaps className="text-[7px]">Project</DxCaps>
                <div className="text-[13px] font-medium text-[#0D0D0B]">{p.name}</div>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col bg-[#FAFAF5] lg:col-span-1">
        <AiChatCore projects={projects} />
      </div>

      <aside className="hidden border-l border-[#E4E4DC] bg-white lg:flex lg:flex-col">
        <div className="border-b border-[#E4E4DC] px-3 pt-1">
          <div className="flex gap-0">
            <button type="button" className="border-b-2 border-[#1C4A2E] px-3 py-2 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] text-[#1C4A2E]">
              System
            </button>
            <button type="button" className="px-3 py-2 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.1em] text-[#A8A89E]">
              Risks
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <DxCaps className="mb-2 block">Projects</DxCaps>
          {projects.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-[#A8A89E]">No projects yet.</p>
              <Link href="/project/new" className="text-xs font-medium text-[#1C4A2E] underline">
                Create project →
              </Link>
            </div>
          ) : (
            projects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="mb-1.5 border border-[#E4E4DC] border-l-[3px] border-l-[#2D7048] px-2.5 py-2"
              >
                <div className="text-[13px] font-medium">{p.name}</div>
                <DxCaps className="text-[7px]">Active</DxCaps>
              </div>
            ))
          )}
          <DxCaps className="mb-2 mt-4 block">Guardrails</DxCaps>
          <div className="border border-[#C6DDD0] bg-[#EEF5F1] p-2.5 text-xs leading-relaxed text-[#2C2C28]">
            Preview → approve → persist. AI suggests; your team decides.
          </div>
        </div>
      </aside>
    </div>
  );
}
