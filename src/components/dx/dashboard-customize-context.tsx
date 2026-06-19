"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readDashboardPrefs,
  setPanelCollapsed,
  setPanelHidden,
  writeDashboardPrefs,
  type DashboardPersonaId,
  type DashboardPrefs,
} from "@/lib/dashboard-prefs";
import {
  readDashboardInlineEdits,
  resolveInlineText,
  setInlineEditField,
  writeDashboardInlineEdits,
  type DashboardInlineEdits,
} from "@/lib/dashboard-inline-edit";

type DashboardCustomizeContextValue = {
  personaId: DashboardPersonaId;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  contentEditMode: boolean;
  setContentEditMode: (value: boolean) => void;
  prefs: DashboardPrefs;
  inlineEdits: DashboardInlineEdits;
  resolveFieldText: (fieldKey: string, defaultValue: string) => string;
  setFieldText: (fieldKey: string, value: string) => void;
  toggleCollapsed: (panelId: string) => void;
  toggleHidden: (panelId: string) => void;
  isCollapsed: (panelId: string) => boolean;
  isHidden: (panelId: string) => boolean;
};

const DashboardCustomizeContext = createContext<DashboardCustomizeContextValue | null>(null);

export function DashboardCustomizeProvider({
  personaId,
  children,
}: {
  personaId: DashboardPersonaId;
  children: ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);
  const [contentEditMode, setContentEditMode] = useState(false);
  const [prefs, setPrefs] = useState<DashboardPrefs>(() => readDashboardPrefs(personaId));
  const [inlineEdits, setInlineEdits] = useState<DashboardInlineEdits>(() =>
    readDashboardInlineEdits(personaId),
  );
  const [loadedPersonaId, setLoadedPersonaId] = useState(personaId);

  if (loadedPersonaId !== personaId) {
    setLoadedPersonaId(personaId);
    setPrefs(readDashboardPrefs(personaId));
    setInlineEdits(readDashboardInlineEdits(personaId));
  }

  const persistPrefs = useCallback(
    (next: DashboardPrefs) => {
      setPrefs(next);
      writeDashboardPrefs(personaId, next);
    },
    [personaId],
  );

  const persistInlineEdits = useCallback(
    (next: DashboardInlineEdits) => {
      setInlineEdits(next);
      writeDashboardInlineEdits(personaId, next);
    },
    [personaId],
  );

  const resolveFieldText = useCallback(
    (fieldKey: string, defaultValue: string) =>
      resolveInlineText(inlineEdits, fieldKey, defaultValue),
    [inlineEdits],
  );

  const setFieldText = useCallback(
    (fieldKey: string, value: string) => {
      persistInlineEdits(setInlineEditField(inlineEdits, fieldKey, value));
    },
    [inlineEdits, persistInlineEdits],
  );

  const toggleCollapsed = useCallback(
    (panelId: string) => {
      persistPrefs(setPanelCollapsed(prefs, panelId, !prefs.collapsed[panelId]));
    },
    [persistPrefs, prefs],
  );

  const toggleHidden = useCallback(
    (panelId: string) => {
      persistPrefs(setPanelHidden(prefs, panelId, !prefs.hidden[panelId]));
    },
    [persistPrefs, prefs],
  );

  const value = useMemo(
    () => ({
      personaId,
      editMode,
      setEditMode,
      contentEditMode,
      setContentEditMode,
      prefs,
      inlineEdits,
      resolveFieldText,
      setFieldText,
      toggleCollapsed,
      toggleHidden,
      isCollapsed: (panelId: string) => Boolean(prefs.collapsed[panelId]),
      isHidden: (panelId: string) => Boolean(prefs.hidden[panelId]),
    }),
    [
      personaId,
      editMode,
      contentEditMode,
      prefs,
      inlineEdits,
      resolveFieldText,
      setFieldText,
      toggleCollapsed,
      toggleHidden,
    ],
  );

  return (
    <DashboardCustomizeContext.Provider value={value}>{children}</DashboardCustomizeContext.Provider>
  );
}

export function useDashboardCustomize(): DashboardCustomizeContextValue {
  const ctx = useContext(DashboardCustomizeContext);
  if (!ctx) {
    throw new Error("useDashboardCustomize must be used within DashboardCustomizeProvider");
  }
  return ctx;
}

export function useOptionalDashboardCustomize(): DashboardCustomizeContextValue | null {
  return useContext(DashboardCustomizeContext);
}
