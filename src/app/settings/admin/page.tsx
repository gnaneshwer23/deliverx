import Link from "next/link";
import { redirect } from "next/navigation";
import { DxPageHeader } from "@/components/dx/dx-page-chrome";
import { SettingsNav } from "@/components/settings/settings-nav";
import { OrgStructureAdminForm } from "@/components/org-structure/admin-form";
import {
  OrgConfigForm,
  OrgMemberAssignForm,
  ProjectConfigForm,
} from "@/components/pilot-admin/admin-forms";
import { hasDeveloperAccess } from "@/lib/developer-access";
import { dxClass } from "@/lib/dx-theme";
import { isOrgAdmin } from "@/lib/org-admin";
import {
  PILOT_ADMIN_AUDIT_NOTE,
  PILOT_ADMIN_FRAMEWORK_PIN,
  isPilotAdminEnabled,
  listOrgProjectConfigs,
  loadOrgConfig,
  resolvePilotAdminActor,
} from "@/lib/pilot-admin";
import { loadOrgStructure } from "@/lib/org-structure";
import { SETTINGS_PROFILE_PATH } from "@/lib/settings-routing";
import { createClient } from "@/lib/supabase/server";
import { listOrgMembers } from "@/services/delivery";

export const dynamic = "force-dynamic";

export default async function PilotAdminSettingsPage() {
  if (!isPilotAdminEnabled()) {
    redirect(SETTINGS_PROFILE_PATH);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/settings/admin")}`);
  }

  const actor = await resolvePilotAdminActor(supabase, user.id);
  if (!actor || !isOrgAdmin(actor.role)) {
    redirect(SETTINGS_PROFILE_PATH);
  }

  const [organisation, projects, snapshot, members] = await Promise.all([
    loadOrgConfig(supabase, actor.organisationId),
    listOrgProjectConfigs(supabase, actor.organisationId).catch(() => []),
    loadOrgStructure(supabase, actor.organisationId).catch(() => null),
    listOrgMembers().catch(() => []),
  ]);

  const developer = hasDeveloperAccess(actor.role, user);

  return (
    <>
      <DxPageHeader
        breadcrumb="DeliverX · Settings"
        title="Pilot admin"
        titleEm="org & project"
      />
      <div className="space-y-6 p-6 md:p-8">
        <SettingsNav isAdmin isDeveloper={developer} />

        <section className={`${dxClass.cardPad}`} role="note">
          <h2 className="mb-2 font-semibold">Audit and trust rails</h2>
          <p className="text-sm text-[#6B6B64]">{PILOT_ADMIN_AUDIT_NOTE.summary}</p>
          <p className="mt-2 text-sm text-[#6B6B64]">{PILOT_ADMIN_AUDIT_NOTE.rails}</p>
          <p className="mt-3 text-xs text-[#6B6B64]">
            Framework pin for ScoreRuns:{" "}
            <span className="font-medium text-[#1C1C1A]">{PILOT_ADMIN_FRAMEWORK_PIN}</span>
            . Full framework CMS depth is out of this thin pilot surface.{" "}
            <Link href="/workspace/audit" className="underline underline-offset-2">
              View organisation audit trail
            </Link>
            .
          </p>
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-2 font-semibold">Organisation</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Context used for Experience and Professional Workspace — not a multi-org CMS.
          </p>
          {organisation ? (
            <OrgConfigForm organisation={organisation} />
          ) : (
            <p className="text-sm text-[#6B6B64]">No organisation configured.</p>
          )}
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-2 font-semibold">Projects</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Edit name, goal, delivery type, and status for pilot delivery context. This is not
            PMO portfolio management.
          </p>
          {projects.length === 0 ? (
            <p className="text-sm text-[#6B6B64]">
              No projects yet. Create one from{" "}
              <Link href="/project/new" className="underline underline-offset-2">
                New project
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-6">
              {projects.map((project) => (
                <ProjectConfigForm key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        <section className={`${dxClass.cardPad}`}>
          <h2 className="mb-2 font-semibold">Organisation structure</h2>
          <p className="mb-4 text-sm text-[#6B6B64]">
            Departments and teams for Team Copilot / Professional Workspace. Structure does not
            assign capability.
          </p>
          {snapshot ? (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-medium">
                    Departments ({snapshot.departments.length})
                  </h3>
                  {snapshot.departments.length === 0 ? (
                    <p className="text-xs text-[#6B6B64]">None yet.</p>
                  ) : (
                    <ul className="divide-y divide-[#F0F0E8] text-sm">
                      {snapshot.departments.map((d) => (
                        <li key={d.id} className="py-2">
                          <p className="font-medium">{d.name}</p>
                          <p className="text-[10px] text-[#6B6B64]">
                            {
                              snapshot.departmentMembers.filter((m) => m.departmentId === d.id)
                                .length
                            }{" "}
                            members
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium">Teams ({snapshot.teams.length})</h3>
                  {snapshot.teams.length === 0 ? (
                    <p className="text-xs text-[#6B6B64]">None yet.</p>
                  ) : (
                    <ul className="divide-y divide-[#F0F0E8] text-sm">
                      {snapshot.teams.map((t) => (
                        <li key={t.id} className="py-2">
                          <p className="font-medium">{t.name}</p>
                          <p className="text-[10px] text-[#6B6B64]">
                            {snapshot.teamMembers.filter((m) => m.teamId === t.id).length} members
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <OrgStructureAdminForm
                departments={snapshot.departments.map((d) => ({ id: d.id, name: d.name }))}
              />
              <div className="mt-6 border-t border-[#F0F0E8] pt-4">
                <h3 className="mb-2 text-sm font-medium">Assign members</h3>
                <OrgMemberAssignForm
                  departments={snapshot.departments.map((d) => ({ id: d.id, name: d.name }))}
                  teams={snapshot.teams.map((t) => ({ id: t.id, name: t.name }))}
                  members={members.map((m) => ({
                    id: m.id,
                    label: m.name ?? m.email ?? m.id,
                  }))}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6B6B64]">Could not load organisation structure.</p>
          )}
        </section>
      </div>
    </>
  );
}
