"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getWorkspaceModule,
  type WorkspaceModuleId,
} from "@/lib/professional-workspace/modules";
import type { WorkspaceProjectRef } from "@/lib/professional-workspace/project-context";
import {
  WorkspacePageHeader,
  WorkspaceProductFrame,
} from "@/components/professional-workspace/workspace-product-frame";

export function ProfessionalModuleChrome({
  moduleId,
  project,
  children,
  empty,
  error,
}: {
  moduleId: WorkspaceModuleId;
  project: WorkspaceProjectRef | null;
  children?: React.ReactNode;
  empty?: boolean;
  error?: string | null;
}) {
  const mod = getWorkspaceModule(moduleId);
  const pathname = usePathname();

  const aside = (
    <>
      <section>
        <h2>What matters</h2>
        <p style={{ marginTop: 8 }}>{mod.userJobs[0]}</p>
      </section>
      <section>
        <h2>Next actions</h2>
        <ul>
          {mod.primaryActions.slice(0, 3).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Evidence &amp; ownership</h2>
        <p style={{ marginTop: 8 }}>
          Data ownership: {mod.dataOwnership}. Evidence kinds when observation is on:{" "}
          {mod.evidenceGenerated.join(", ")}.
        </p>
        <p style={{ marginTop: 8, fontSize: "0.8rem" }}>
          Done when: {mod.completionState}. Contribution trail: authored → suggested → accepted →
          edited → submitted → outcome.
        </p>
        <p style={{ marginTop: 12 }}>
          <Link href="/profile/evidence">Open Evidence Ledger</Link>
        </p>
      </section>
      <p style={{ fontSize: "0.7rem", color: "var(--pw-muted)" }}>
        Active module: {moduleId}. Path: {pathname}.
      </p>
    </>
  );

  return (
    <WorkspaceProductFrame project={project} aside={aside}>
      <WorkspacePageHeader
        eyebrow={`Professional Workspace · ${mod.label}`}
        title={mod.label}
        lead={mod.userJobs[0]}
        context={
          project ? (
            <div className="pw-context-card">
              <span>Project</span>
              <strong>{project.name}</strong>
              <small>
                {project.subtitle ? `${project.subtitle} · ` : ""}
                <Link href={project.href} style={{ color: "var(--pw-accent)", fontWeight: 700 }}>
                  Open source
                </Link>
              </small>
            </div>
          ) : (
            <div className="pw-context-card">
              <span>Project</span>
              <strong>None selected</strong>
              <small>
                <Link href="/workspace" style={{ color: "var(--pw-accent)", fontWeight: 700 }}>
                  Choose on Workspace home
                </Link>
              </small>
            </div>
          )
        }
      />

      {!project ? (
        <div className="pw-notice warn" role="status">
          No project selected —{" "}
          <Link href="/workspace" style={{ textDecoration: "underline", fontWeight: 700 }}>
            choose one on Workspace home
          </Link>
        </div>
      ) : null}

      {error ? (
        <div className="pw-notice danger" role="alert">
          {error || mod.errorState}
        </div>
      ) : empty ? (
        <div className="pw-empty" role="status">
          <strong>Nothing here yet</strong>
          {mod.emptyState}
          <ul style={{ marginTop: 14, paddingLeft: 18 }}>
            {mod.primaryActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p style={{ marginTop: 14, fontSize: "0.8rem" }}>
            AI may {mod.aiActions[0]?.toLowerCase()}. AI never auto-completes your work or assigns
            capability.
          </p>
        </div>
      ) : (
        children
      )}
    </WorkspaceProductFrame>
  );
}
