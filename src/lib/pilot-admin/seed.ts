/**
 * Documented pilot seed for B8 — no schema churn.
 * Framework catalogue remains the existing admin-framework seed (pm-core@2026.1).
 * Org structure uses migration 0093 tables; operators create departments/teams via UI.
 */

import { PILOT_ADMIN_FRAMEWORK_PIN, PILOT_ADMIN_INVARIANTS } from "@/lib/pilot-admin/types";

export const PILOT_ADMIN_SEED = {
  frameworkPin: PILOT_ADMIN_FRAMEWORK_PIN,
  orgStructureMigration: "0093_org_structure.sql",
  allowedSurfaces: [
    "organisation name / industry / team size / delivery type",
    "project name / goal / delivery type / status",
    "departments and teams (org-structure)",
    "department and team membership",
  ],
  excludedSurfaces: [
    "enterprise mission-control / PMO portfolio depth",
    "full competency framework CMS editor",
    "marketplace liquidity",
    "third SKU",
    "Verified lighting",
    "evidence or ScoreRun mutation",
  ],
  invariants: PILOT_ADMIN_INVARIANTS,
} as const;
