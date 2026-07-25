import { createClient } from "@/lib/supabase/server";
import { loadOrgStructure, resolveOrgActor } from "@/lib/org-structure";
import { isOrgAdmin } from "@/lib/org-admin";
import { OrgStructureAdminForm } from "@/components/org-structure/admin-form";
import { dxClass } from "@/lib/dx-theme";

export async function OrgStructurePanel() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const actor = await resolveOrgActor(supabase, user.id);
  if (!actor) {
    return (
      <section className={`${dxClass.cardPad} lg:col-span-2`}>
        <h2 className={`${dxClass.display} mb-2 text-lg`}>Organisation structure</h2>
        <p className="text-sm text-[#6B6B64]">
          Join or create an organisation to manage departments and teams.
        </p>
      </section>
    );
  }

  const snapshot = await loadOrgStructure(supabase, actor.organisationId).catch(() => null);
  const admin = isOrgAdmin(actor.role);

  return (
    <section className={`${dxClass.cardPad} lg:col-span-2`}>
      <h2 className={`${dxClass.display} mb-2 text-lg`}>Organisation structure</h2>
      <p className="mb-4 text-sm text-[#6B6B64]">
        Departments and teams are shared organisation data loaded at request time. They do not
        assign capability or create Professional Intelligence duplicates. Team Copilot remains
        Professional Workspace — not a third product.
      </p>
      {!snapshot ? (
        <p className="text-sm text-[#6B6B64]">Could not load organisation structure.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium">Departments ({snapshot.departments.length})</h3>
            {snapshot.departments.length === 0 ? (
              <p className="text-xs text-[#6B6B64]">No departments yet.</p>
            ) : (
              <ul className="divide-y divide-[#F0F0E8] text-sm">
                {snapshot.departments.map((d) => (
                  <li key={d.id} className="py-2">
                    <p className="font-medium">{d.name}</p>
                    {d.description ? (
                      <p className="text-xs text-[#6B6B64]">{d.description}</p>
                    ) : null}
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
              <p className="text-xs text-[#6B6B64]">No teams yet.</p>
            ) : (
              <ul className="divide-y divide-[#F0F0E8] text-sm">
                {snapshot.teams.map((t) => (
                  <li key={t.id} className="py-2">
                    <p className="font-medium">{t.name}</p>
                    {t.description ? (
                      <p className="text-xs text-[#6B6B64]">{t.description}</p>
                    ) : null}
                    <p className="text-[10px] text-[#6B6B64]">
                      {snapshot.teamMembers.filter((m) => m.teamId === t.id).length} members
                      {t.departmentId
                        ? ` · ${
                            snapshot.departments.find((d) => d.id === t.departmentId)?.name ??
                            "department"
                          }`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {admin ? (
        <div className="mt-6 border-t border-[#F0F0E8] pt-4">
          <OrgStructureAdminForm
            departments={(snapshot?.departments ?? []).map((d) => ({
              id: d.id,
              name: d.name,
            }))}
          />
        </div>
      ) : (
        <p className="mt-4 text-xs text-[#6B6B64]">
          Only organisation admins (PM / executive) can create departments and teams.
        </p>
      )}
    </section>
  );
}
