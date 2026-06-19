/** Tailwind breakpoint at which the fixed workspace sidebar is shown. */
export const WORKSPACE_SIDEBAR_BREAKPOINT = "lg" as const;

/** Minimum viewport width (px) for the fixed workspace sidebar — matches Tailwind `lg`. */
export const WORKSPACE_SIDEBAR_MIN_WIDTH_PX = 1024;

/** Utility class for main content offset when the workspace sidebar is visible. */
export const workspaceMainOffsetClass =
  "mt-[var(--dx-navh)] min-h-[calc(100vh-var(--dx-navh))] overflow-x-hidden lg:ml-[var(--dx-sbw)]";

/** Main content offset when AppShell renders without the workspace sidebar. */
export const workspaceMainFullWidthClass =
  "mt-[var(--dx-navh)] min-h-[calc(100vh-var(--dx-navh))] overflow-x-hidden";
