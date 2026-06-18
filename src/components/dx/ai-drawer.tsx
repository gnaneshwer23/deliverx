"use client";

import { Cpu, X } from "lucide-react";
import { AiChatCore } from "@/components/dx/ai-chat-core";
import { DxCaps } from "@/components/dx/dx-logo";
import { useAiDrawer } from "@/components/dx/ai-drawer-context";

export function AiDrawer({
  projects,
}: {
  projects: Array<{ id: string; name: string }>;
}) {
  const { open, closeDrawer } = useAiDrawer();

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close AI assistant"
        className="fixed inset-0 z-[60] bg-[#0D0D0B]/30"
        onClick={closeDrawer}
      />
      <aside
        id="drawer"
        className="fixed bottom-0 right-0 top-[var(--dx-navh)] z-[70] flex w-full max-w-md flex-col border-l border-[#E4E4DC] bg-white shadow-2xl"
        aria-label="AI assistant drawer"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E4E4DC] px-4 py-3">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-[#1C4A2E]" />
            <DxCaps className="text-[9px]">AI Assistant</DxCaps>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex size-8 items-center justify-center text-[#6B6B64] hover:bg-[#F7F7F2] hover:text-[#0D0D0B]"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <AiChatCore projects={projects} compact />
        </div>
      </aside>
    </>
  );
}
