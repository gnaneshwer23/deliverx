import {
  nonEssentialPanelIds,
  type DashboardPersonaId,
} from "@/config/dashboard-essential-panels";

export type { DashboardPersonaId } from "@/config/dashboard-essential-panels";

export type DashboardPrefs = {
  collapsed: Record<string, boolean>;
  hidden: Record<string, boolean>;
};

export const EMPTY_DASHBOARD_PREFS: DashboardPrefs = {
  collapsed: {},
  hidden: {},
};

export function dashboardPrefsStorageKey(personaId: DashboardPersonaId): string {
  return `dx-dashboard-prefs:${personaId}`;
}

export function mergeDashboardPrefs(
  current: DashboardPrefs,
  patch: Partial<DashboardPrefs>,
): DashboardPrefs {
  return {
    collapsed: { ...current.collapsed, ...patch.collapsed },
    hidden: { ...current.hidden, ...patch.hidden },
  };
}

export function parseDashboardPrefs(raw: string | null): DashboardPrefs {
  if (!raw) return { ...EMPTY_DASHBOARD_PREFS };
  try {
    const parsed = JSON.parse(raw) as Partial<DashboardPrefs>;
    return {
      collapsed:
        parsed.collapsed && typeof parsed.collapsed === "object" ? { ...parsed.collapsed } : {},
      hidden: parsed.hidden && typeof parsed.hidden === "object" ? { ...parsed.hidden } : {},
    };
  } catch {
    return { ...EMPTY_DASHBOARD_PREFS };
  }
}

export function buildDefaultDashboardPrefs(personaId: DashboardPersonaId): DashboardPrefs {
  const hidden: Record<string, boolean> = {};
  for (const panelId of nonEssentialPanelIds(personaId)) {
    hidden[panelId] = true;
  }
  return { ...EMPTY_DASHBOARD_PREFS, hidden };
}

export function readDashboardPrefs(personaId: DashboardPersonaId): DashboardPrefs {
  if (typeof window === "undefined") return buildDefaultDashboardPrefs(personaId);
  const key = dashboardPrefsStorageKey(personaId);
  const raw = localStorage.getItem(key);
  if (raw === null) return buildDefaultDashboardPrefs(personaId);
  return parseDashboardPrefs(raw);
}

export function writeDashboardPrefs(
  personaId: DashboardPersonaId,
  prefs: DashboardPrefs,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(dashboardPrefsStorageKey(personaId), JSON.stringify(prefs));
}

export function setPanelCollapsed(
  prefs: DashboardPrefs,
  panelId: string,
  collapsed: boolean,
): DashboardPrefs {
  const next = { ...prefs.collapsed };
  if (collapsed) {
    next[panelId] = true;
  } else {
    delete next[panelId];
  }
  return { ...prefs, collapsed: next };
}

export function setPanelHidden(
  prefs: DashboardPrefs,
  panelId: string,
  hidden: boolean,
): DashboardPrefs {
  const next = { ...prefs.hidden };
  if (hidden) {
    next[panelId] = true;
  } else {
    delete next[panelId];
  }
  return { ...prefs, hidden: next };
}

export function isPanelCollapsed(prefs: DashboardPrefs, panelId: string): boolean {
  return Boolean(prefs.collapsed[panelId]);
}

export function isPanelHidden(prefs: DashboardPrefs, panelId: string): boolean {
  return Boolean(prefs.hidden[panelId]);
}
