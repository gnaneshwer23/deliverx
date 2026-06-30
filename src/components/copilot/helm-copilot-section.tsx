import { createClient } from "@/lib/supabase/server";
import { roleToMissionPersona, type MissionPersonaId } from "@/lib/mission-nav";
import { listProjectsForCurrentUser } from "@/services/portfolio";
import { HelmCopilotPanel } from "@/components/copilot/helm-copilot-panel";
import { dxClass } from "@/lib/dx-theme";

export async function HelmCopilotSection({
  projectId,
  personaId: personaIdOverride,
  compact,
  embedded,
}: {
  projectId?: string | null;
  personaId?: MissionPersonaId;
  compact?: boolean;
  /** Mission-control page embed — compact chat with fixed height. */
  embedded?: boolean;
}) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("users").select("role").maybeSingle();
  const personaId =
    personaIdOverride ?? roleToMissionPersona(profile?.role) ?? ("pm-mission" as MissionPersonaId);

  const projectRows = await listProjectsForCurrentUser();
  const projects = projectRows.map((p) => ({ id: p.id, name: p.name }));

  if (embedded) {
    return (
      <section className="mt-6">
        <HelmCopilotPanel
          personaId={personaId}
          projects={projects}
          defaultProjectId={projectId}
          embedded
        />
      </section>
    );
  }

  if (compact) {
    return (
      <HelmCopilotPanel
        personaId={personaId}
        projects={projects}
        defaultProjectId={projectId}
        compact
      />
    );
  }

  return (
    <section className={`${dxClass.cardPad} mt-6`}>
      <HelmCopilotPanel
        personaId={personaId}
        projects={projects}
        defaultProjectId={projectId}
      />
    </section>
  );
}
