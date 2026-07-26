import { Suspense, type ReactNode } from "react";
import type { WorkspaceProjectRef } from "@/lib/professional-workspace/project-context";
import { WorkspaceProductFrame } from "@/components/professional-workspace/workspace-product-frame";
import "./workspace-app.css";

function FrameFallback() {
  return (
    <div className="pw-root">
      <div className="pw-main">
        <p className="pw-lead">Loading Workspace…</p>
      </div>
    </div>
  );
}

/** Server-safe wrapper — Suspense for useSearchParams inside the client frame. */
export function WorkspaceProductShell({
  project = null,
  children,
  aside,
  showRail = true,
}: {
  project?: WorkspaceProjectRef | null;
  children: ReactNode;
  aside?: ReactNode;
  showRail?: boolean;
}) {
  return (
    <Suspense fallback={<FrameFallback />}>
      <WorkspaceProductFrame
        project={project}
        aside={aside}
        showRail={showRail}
      >
        {children}
      </WorkspaceProductFrame>
    </Suspense>
  );
}

export { WorkspacePageHeader } from "@/components/professional-workspace/workspace-product-frame";
