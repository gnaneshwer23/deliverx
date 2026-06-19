import Link from "next/link";
import type { ReactNode } from "react";
import { Building2, FolderKanban } from "lucide-react";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { DxBadge } from "@/components/dx/dx-badge";
import { MissionNavPath } from "@/components/dx/mission-nav-path";
import {
  commandCentreTagline,
  commandCentreTitle,
  getDbRoleDisplayLabel,
  getMissionPersonaMeta,
  missionControlTitle,
  userInitials,
  type MissionPersonaMeta,
} from "@/config/mission-persona-meta";
import { getMissionPersonaAccent, personaBtnPrimary } from "@/config/mission-persona-accent";
import type { MissionPersonaId } from "@/lib/mission-nav";
import { buildNavPathSegments, buildMissionHomePathSegments, resolveNavPathContext } from "@/lib/nav-path";
import { dxClass } from "@/lib/dx-theme";

type ProjectChip = { id: string; name: string };

export type MissionPersonaHeaderProps = {
  personaId: MissionPersonaId;
  userName: string | null;
  orgName?: string | null;
  primaryProject?: ProjectChip | null;
  /** Overrides persona tagline — e.g. day-one PM welcome copy (P-PM-0). */
  subtitle?: string;
  action?: ReactNode;
};

export type CommandCentreHeaderProps = {
  variant: "command-centre";
  userRole: string | null;
  userName: string | null;
  orgName?: string | null;
  titleEm?: string;
  action?: ReactNode;
  pathname?: string;
};

export function DefaultMissionAction({
  meta,
  primaryProject,
}: {
  meta: MissionPersonaMeta;
  primaryProject?: ProjectChip | null;
}) {
  const accent = getMissionPersonaAccent(meta.personaId);
  const btn = personaBtnPrimary(accent);

  if (meta.personaId === "founder") {
    return (
      <Link href="/workspace/portfolio" className={`${dxClass.btnGhost} text-[10px]`}>
        {meta.workspaceActionLabel}
      </Link>
    );
  }

  if (primaryProject) {
    return (
      <Link
        href={meta.workspacePath(primaryProject.id)}
        className={`${btn.className} text-[10px]`}
        style={btn.style}
      >
        {meta.workspaceActionLabel}
      </Link>
    );
  }

  return (
    <Link href="/project/new" className={`${btn.className} text-[10px]`} style={btn.style}>
      {meta.newProjectLabel}
    </Link>
  );
}

function IdentityRow({
  userName,
  roleLabel,
  badgeTone,
  orgName,
  primaryProject,
  personaId,
}: {
  userName: string | null;
  roleLabel: string;
  badgeTone: MissionPersonaMeta["badgeTone"];
  orgName?: string | null;
  primaryProject?: ProjectChip | null;
  personaId?: MissionPersonaId;
}) {
  const accent = personaId ? getMissionPersonaAccent(personaId) : null;
  const PersonaIcon = personaId ? getMissionPersonaMeta(personaId).icon : null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2.5">
      <div className="flex items-center gap-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0D0D0B] font-[family-name:var(--font-dx-display)] text-sm text-white"
          aria-hidden
        >
          {userInitials(userName)}
        </span>
        {userName ? (
          <span className="text-sm font-medium text-[#2C2C28]">{userName}</span>
        ) : null}
      </div>
      <span className="inline-flex items-center gap-1">
        {PersonaIcon && accent ? (
          <PersonaIcon size={12} style={{ color: accent.primary }} aria-hidden />
        ) : null}
        <DxBadge tone={badgeTone}>{roleLabel}</DxBadge>
      </span>
      {orgName ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#E4E4DC] bg-[#F7F7F2] px-2.5 py-0.5 text-xs text-[#6B6B64]">
          <Building2 size={12} className="text-[#A8A89E]" aria-hidden />
          {orgName}
        </span>
      ) : null}
      {primaryProject && accent ? (
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
          style={{ borderColor: accent.border, backgroundColor: accent.bg, color: accent.text }}
        >
          <FolderKanban size={12} style={{ color: accent.mid }} aria-hidden />
          {primaryProject.name}
        </span>
      ) : primaryProject ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-[#C6DDD0] bg-[#EEF5F1] px-2.5 py-0.5 text-xs font-medium text-[#1C4A2E]">
          <FolderKanban size={12} className="text-[#3D9660]" aria-hidden />
          {primaryProject.name}
        </span>
      ) : null}
    </div>
  );
}

export function MissionPersonaHeader({
  personaId,
  userName,
  orgName,
  primaryProject,
  subtitle,
  action,
}: MissionPersonaHeaderProps) {
  const meta = getMissionPersonaMeta(personaId);
  const accent = getMissionPersonaAccent(personaId);
  const { title, titleEm } = missionControlTitle(meta.roleLabel);

  return (
    <DxPageHeader
      breadcrumb={meta.breadcrumb}
      title={title}
      titleEm={titleEm}
      subtitle={subtitle ?? meta.tagline}
      sticky
      accent={accent}
      action={action ?? <DefaultMissionAction meta={meta} primaryProject={primaryProject} />}
      breadcrumbNode={
        <MissionNavPath
          segments={buildMissionHomePathSegments(personaId)}
          showHomeIcon
          className="mb-1"
        />
      }
    >
      <IdentityRow
        userName={userName}
        roleLabel={meta.roleLabel}
        badgeTone={meta.badgeTone}
        orgName={orgName}
        primaryProject={primaryProject}
        personaId={personaId}
      />
    </DxPageHeader>
  );
}

export function CommandCentrePersonaHeader({
  userRole,
  userName,
  orgName,
  titleEm,
  action,
  pathname = "/workspace/dashboard",
}: Omit<CommandCentreHeaderProps, "variant">) {
  const roleLabel = getDbRoleDisplayLabel(userRole);
  const navContext = resolveNavPathContext(pathname, userRole);

  return (
    <DxPageHeader
      breadcrumb="DeliverX OS · Command Centre"
      title={commandCentreTitle(userRole, userName)}
      titleEm={titleEm}
      subtitle={commandCentreTagline(userRole, orgName ?? null)}
      sticky
      action={action}
      breadcrumbNode={
        <MissionNavPath
          segments={buildNavPathSegments(navContext)}
          showHomeIcon
          className="mb-1"
        />
      }
    >
      <IdentityRow
        userName={userName}
        roleLabel={roleLabel}
        badgeTone="accent"
        orgName={orgName}
      />
    </DxPageHeader>
  );
}
