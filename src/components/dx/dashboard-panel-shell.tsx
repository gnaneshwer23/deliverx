"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import { useDashboardCustomize } from "@/components/dx/dashboard-customize-context";
import { InlineEditableText } from "@/components/dx/inline-editable-text";
import { panelNoteFieldKey } from "@/lib/dashboard-inline-edit";
import { dxClass } from "@/lib/dx-theme";

export type DashboardPanelShellProps = {
  panelId: string;
  title: string;
  href?: string;
  className?: string;
  card?: boolean;
  ownerNote?: string;
  ownerNotePlaceholder?: string;
  children: ReactNode;
};

export function DashboardPanelShell({
  panelId,
  title,
  href,
  className,
  card = false,
  ownerNote,
  ownerNotePlaceholder = "Add owner notes for this panel…",
  children,
}: DashboardPanelShellProps) {
  const { editMode, contentEditMode, isCollapsed, isHidden, toggleCollapsed, toggleHidden, resolveFieldText } =
    useDashboardCustomize();

  const collapsed = isCollapsed(panelId);
  const hidden = isHidden(panelId);
  const noteFieldKey = panelNoteFieldKey(panelId);
  const resolvedNote = ownerNote != null ? resolveFieldText(noteFieldKey, ownerNote) : "";
  const showOwnerNote = ownerNote != null && (contentEditMode || resolvedNote.trim().length > 0);

  if (hidden && !editMode) {
    return null;
  }

  return (
    <section
      id={panelId}
      className={`${className ?? ""} ${hidden && editMode ? "opacity-60" : ""}`.trim()}
      data-panel-id={panelId}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => toggleCollapsed(panelId)}
            className="inline-flex shrink-0 items-center justify-center rounded border border-[#E4E4DC] bg-white p-1 text-[#6B6B64] transition hover:border-[#1C4A2E] hover:text-[#1C4A2E]"
            aria-expanded={!collapsed}
            aria-controls={`panel-body-${panelId}`}
            aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
          >
            {collapsed ? <ChevronRight size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
          </button>
          <h2 className={dxClass.panelTitle}>{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <label className="inline-flex cursor-pointer items-center gap-1.5 font-[family-name:var(--font-dx-mono)] text-[9px] uppercase tracking-[0.08em] text-[#6B6B64]">
              <input
                type="checkbox"
                checked={!hidden}
                onChange={() => toggleHidden(panelId)}
                className="size-3.5 accent-[#1C4A2E]"
              />
              Show
            </label>
          ) : null}
          {href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-0.5 font-[family-name:var(--font-dx-mono)] text-[8px] uppercase tracking-[0.06em] text-[#1C4A2E] hover:text-[#2D7048]"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          ) : null}
        </div>
      </div>
      {showOwnerNote ? (
        <InlineEditableText
          fieldKey={noteFieldKey}
          defaultValue={ownerNote ?? ""}
          className="mb-3 text-sm text-[#6B6B64]"
          placeholder={ownerNotePlaceholder}
          label="Owner note"
        />
      ) : null}
      {!collapsed ? (
        <div id={`panel-body-${panelId}`} className={dxClass.panelShellBody}>
          {card ? <div className={dxClass.cardPad}>{children}</div> : children}
        </div>
      ) : null}
    </section>
  );
}
