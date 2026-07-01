import { describe, expect, it } from "vitest";
import {
  impactEventsToNextUpItems,
  mergeImpactIntoMissionNextUp,
} from "@/lib/mission-impact-next-up";
import type { DeliveryImpactEventRow } from "@/services/deliveryImpact";

function impactEvent(
  patch: Partial<DeliveryImpactEventRow> & Pick<DeliveryImpactEventRow, "message" | "target_role">,
): DeliveryImpactEventRow {
  return {
    id: patch.id ?? "evt-1",
    organisation_id: "org-1",
    project_id: patch.project_id ?? "proj-1",
    source: "artifact",
    source_id: null,
    proposal_id: null,
    action_type: "business_case_upload",
    entity_type: "charter",
    entity_id: null,
    tone: patch.tone ?? "waiting",
    created_at: patch.created_at ?? new Date().toISOString(),
    ...patch,
  };
}

describe("mission-impact-next-up", () => {
  it("maps PM-targeted BA join signals to next up items", () => {
    const items = impactEventsToNextUpItems(
      [
        impactEvent({
          message: "Alex joined Acme Portal as BA",
          target_role: "pm",
          tone: "updated",
        }),
      ],
      "pm-mission",
      "proj-1",
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.label).toContain("joined");
    expect(items[0]?.href).toBe("/workspace/ba?project=proj-1");
    expect(items[0]?.tone).toBe("blue");
  });

  it("links BA invite signals to pm-mission anchor", () => {
    const items = impactEventsToNextUpItems(
      [
        impactEvent({
          message: "BA invite link ready — share to onboard requirements lead",
          target_role: "pm",
        }),
      ],
      "pm-mission",
      "proj-1",
    );

    expect(items[0]?.href).toBe("/workspace/pm-mission?project=proj-1#ba-invite");
  });

  it("merges impact items ahead of existing next up without duplicates", () => {
    const merged = mergeImpactIntoMissionNextUp(
      [
        {
          id: "pending-reviews",
          label: "Review structure bundle",
          href: "/workspace/proposals?persona=pm-mission",
          tone: "amber",
          priority: 20,
        },
      ],
      [
        {
          id: "impact-1",
          label: "BA invite link ready — share to onboard requirements lead",
          href: "/workspace/pm-mission?project=proj-1#ba-invite",
          tone: "amber",
          priority: 5,
        },
      ],
    );

    expect(merged).toHaveLength(2);
    expect(merged[0]?.id).toBe("impact-1");
    expect(merged[1]?.id).toBe("pending-reviews");
  });
});
