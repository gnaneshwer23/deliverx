/**
 * Admin UX requirements for the Competency Framework console.
 * Documented for product/engineering; not a full UI implementation.
 */

export const ADMIN_FRAMEWORK_UX = {
  surface: {
    route: "/settings/framework",
    navLabel: "Competency framework",
    gate: "requireOrgAdmin",
    note: "Reuse Brain/settings org-admin pattern (pm | executive). Platform-wide catalogue may later need a dedicated catalogue_admin claim.",
  },

  requiredScreens: [
    {
      id: "catalogue",
      title: "Framework catalogue",
      purpose: "List frameworks and versions with publication status pills.",
    },
    {
      id: "editor",
      title: "Version editor",
      purpose:
        "Edit role families, roles, seniority, competencies, indicators, anchors, assessment content, evidence rules, portfolio expectations, readiness.",
    },
    {
      id: "validation",
      title: "Validation panel",
      purpose: "Live errors/warnings from validateFrameworkVersionGraph before status transitions.",
    },
    {
      id: "preview",
      title: "Learner / assessor preview",
      purpose:
        "Read-only preview of how roles, readiness, and rubric anchors appear to runtime consumers.",
    },
    {
      id: "compare",
      title: "Version comparison",
      purpose: "Diff two framework versions (added/removed/changed entities).",
    },
    {
      id: "dependencies",
      title: "Dependency warnings",
      purpose:
        "Surface roles without readiness, indicators without assessment coverage, orphaned evidence rules.",
    },
    {
      id: "publish",
      title: "Publish confirmation",
      purpose:
        "Modal requiring confirmImmutable + acknowledgement of warnings; explains assessments will pin this version forever.",
    },
    {
      id: "audit",
      title: "Audit history",
      purpose: "Append-only timeline of transitions and entity edits from pi_cf_audit_events.",
    },
    {
      id: "lifecycle_controls",
      title: "Rollback / deprecation controls",
      purpose:
        "Deprecate published versions; archive; clone prior version as new draft (never mutate published content).",
    },
  ],

  hardRules: [
    "Published framework versions are immutable in the UI — edit controls disable; Clone version is the primary CTA.",
    "Assessments and capability score runs always display the pinned framework_version_id; never silently upgrade historical judgements.",
    "Capability is not assigned by Experience or Launchpad — evidence rules must not include assignsCapability.",
    "Publish requires explicit confirmation and acknowledgement of remaining warnings.",
    "Deprecation keeps the version readable for pinned historical assessments; archive hides from new selection but retains pin resolution.",
  ],

  publishChecklist: [
    "Validation errors = 0",
    "Warnings acknowledged or resolved",
    "Version comparison reviewed vs previous published",
    "confirmImmutable accepted",
    "Rubric bridge (pi_rubric_versions) sync planned",
  ],
} as const;

export type AdminFrameworkUxScreenId =
  (typeof ADMIN_FRAMEWORK_UX.requiredScreens)[number]["id"];
