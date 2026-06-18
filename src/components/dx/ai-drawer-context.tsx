"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type AiDrawerContextValue = {
  open: boolean;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const AiDrawerContext = createContext<AiDrawerContextValue | null>(null);

export function AiDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggleDrawer = useCallback(() => setOpen((v) => !v), []);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, toggleDrawer, openDrawer, closeDrawer }),
    [open, toggleDrawer, openDrawer, closeDrawer],
  );

  return <AiDrawerContext.Provider value={value}>{children}</AiDrawerContext.Provider>;
}

export function useAiDrawer() {
  const ctx = useContext(AiDrawerContext);
  if (!ctx) {
    throw new Error("useAiDrawer must be used within AiDrawerProvider");
  }
  return ctx;
}
