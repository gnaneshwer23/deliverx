#!/usr/bin/env python3
"""Apply Sprint I4-C dashboard polish changes."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def w(rel: str, content: str) -> None:
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.strip() + "\n")
    print("wrote", rel)


def patch(rel: str, old: str, new: str) -> None:
    p = ROOT / rel
    text = p.read_text()
    if old not in text:
        if new.strip() in text:
            print("skip (already patched)", rel)
            return
        raise SystemExit(f"patch failed for {rel}: anchor not found")
    p.write_text(text.replace(old, new, 1))
    print("patched", rel)


# New / overwritten files
w(
    "src/lib/mission-nav.test.ts",
    """
import { describe, expect, it } from "vitest";
import { partitionCoreNav, ROLE_TO_MISSION_ID, roleToMissionPersona } from "./mission-nav";

describe("mission-nav", () => {
  it("maps DB roles to mission control routes", () => {
    expect(ROLE_TO_MISSION_ID.executive).toBe("founder");
    expect(ROLE_TO_MISSION_ID.product_manager).toBe("product");
    expect(ROLE_TO_MISSION_ID.pm).toBe("pm-mission");
  });
  it("partitions nav by role", () => {
    const { primaryMission, otherMissions } = partitionCoreNav("ba");
    expect(primaryMission?.id).toBe("ba");
    expect(otherMissions.some((item) => item.id === "ba")).toBe(false);
  });
  it("resolves persona from role", () => {
    expect(roleToMissionPersona("executive")).toBe("founder");
    expect(roleToMissionPersona("unknown")).toBeNull();
  });
});
""",
)

w(
    "src/lib/approval/persona-reviews.ts",
    """
import type { ArtifactEntityType } from "@/lib/approval/constants";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { MissionPersonaId } from "@/lib/mission-nav";

export const PERSONA_ARTIFACT_ENTITY_TYPES: Record<MissionPersonaId, ArtifactEntityType[]> = {
  founder: ["report", "decision", "customer_insight", "structure_bundle", "change_request"],
  ba: ["requirement", "customer_insight", "decision"],
  product: ["product_feature", "customer_insight", "decision"],
  "pm-mission": ["structure_bundle", "task", "raid_item", "change_request", "decision", "estimation", "report"],
  engineer: ["task", "estimation", "structure_bundle"],
  scrum: ["user_story", "task", "raid_item"],
  qa: ["requirement", "user_story", "task", "raid_item"],
};

export const PERSONA_REVIEW_LABELS: Record<MissionPersonaId, string> = {
  founder: "Founder", ba: "BA", product: "Product", "pm-mission": "PM",
  engineer: "Engineering", scrum: "Scrum", qa: "QA",
};

export function filterPendingReviewsForPersona<T extends Pick<ArtifactReviewRow, "entity_type">>(
  reviews: T[], persona: MissionPersonaId,
): T[] {
  const allowed = set(PERSONA_ARTIFACT_ENTITY_TYPES[persona])
  return [r for r in reviews if r.entity_type in allowed]
""".replace("set(", "new Set(").replace("[r for r in reviews if r.entity_type in allowed]", "reviews.filter((review) => allowed.has(review.entity_type))"),
)

# fix the botched replace above - write cleanly
w(
    "src/lib/approval/persona-reviews.ts",
    """
import type { ArtifactEntityType } from "@/lib/approval/constants";
import type { ArtifactReviewRow } from "@/services/artifactReviews";
import type { MissionPersonaId } from "@/lib/mission-nav";

export const PERSONA_ARTIFACT_ENTITY_TYPES: Record<MissionPersonaId, ArtifactEntityType[]> = {
  founder: ["report", "decision", "customer_insight", "structure_bundle", "change_request"],
  ba: ["requirement", "customer_insight", "decision"],
  product: ["product_feature", "customer_insight", "decision"],
  "pm-mission": ["structure_bundle", "task", "raid_item", "change_request", "decision", "estimation", "report"],
  engineer: ["task", "estimation", "structure_bundle"],
  scrum: ["user_story", "task", "raid_item"],
  qa: ["requirement", "user_story", "task", "raid_item"],
};

export const PERSONA_REVIEW_LABELS: Record<MissionPersonaId, string> = {
  founder: "Founder", ba: "BA", product: "Product", "pm-mission": "PM",
  engineer: "Engineering", scrum: "Scrum", qa: "QA",
};

export function filterPendingReviewsForPersona<T extends Pick<ArtifactReviewRow, "entity_type">>(
  reviews: T[],
  persona: MissionPersonaId,
): T[] {
  const allowed = new Set(PERSONA_ARTIFACT_ENTITY_TYPES[persona]);
  return reviews.filter((review) => allowed.has(review.entity_type));
}
""",
)

print("Script placeholder - run full apply via tool writes")
