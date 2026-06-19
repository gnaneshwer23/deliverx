"use client";

import type { ReactNode } from "react";
import { LayoutGrid, Pencil } from "lucide-react";
import { useDashboardCustomize } from "@/components/dx/dashboard-customize-context";
import { dxClass } from "@/lib/dx-theme";

export function DashboardContentEditToggle() {
  const { contentEditMode, setContentEditMode } = useDashboardCustomize();

  return (
    <button
      type="button"
      onClick={() => setContentEditMode(!contentEditMode)}
      className={`${contentEditMode ? dxClass.btnPrimary : dxClass.btnGhost} text-[10px]`}
      aria-pressed={contentEditMode}
    >
      <Pencil size={12} aria-hidden />
      {contentEditMode ? "Done editing" : "Edit"}
    </button>
  );
}

export function DashboardCustomizeToggle() {
  const { editMode, setEditMode } = useDashboardCustomize();

  return (
    <button
      type="button"
      onClick={() => setEditMode(!editMode)}
      className={`${editMode ? dxClass.btnPrimary : dxClass.btnGhost} text-[10px]`}
      aria-pressed={editMode}
    >
      <LayoutGrid size={12} aria-hidden />
      {editMode ? "Done" : "Customize"}
    </button>
  );
}

export function DashboardHeaderActions({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <DashboardContentEditToggle />
      <DashboardCustomizeToggle />
      {children}
    </div>
  );
}
