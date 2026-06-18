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

type DashboardCustomizeContextValue = {
  personaId: DashboardPersonaId;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  prefs: DashboardPrefs;
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
  const [prefs, setPrefs] = useState<DashboardPrefs>(() => readDashboardPrefs(personaId));
  const [loadedPersonaId, setLoadedPersonaId] = useState(personaId);

  if (loadedPersonaId !== personaId) {
    setLoadedPersonaId(personaId);
    setPrefs(readDashboardPrefs(personaId));
  }

  const persist = useCallback(
    (next: DashboardPrefs) => {
      setPrefs(next);
      writeDashboardPrefs(personaId, next);
    },
    [personaId],
  );

  const toggleCollapsed = useCallback(
    (panelId: string) => {
      persist(setPanelCollapsed(prefs, panelId, !prefs.collapsed[panelId]));
    },
    [persist, prefs],
  );

  const toggleHidden = useCallback(
    (panelId: string) => {
      persist(setPanelHidden(prefs, panelId, !prefs.hidden[panelId]));
    },
    [persist, prefs],
  );

  const value = useMemo(
    () => ({
      personaId,
      editMode,
      setEditMode,
      prefs,
      toggleCollapsed,
      toggleHidden,
      isCollapsed: (panelId: string) => Boolean(prefs.collapsed[panelId]),
      isHidden: (panelId: string) => Boolean(prefs.hidden[panelId]),
    }),
    [personaId, editMode, prefs, toggleCollapsed, toggleHidden],
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
