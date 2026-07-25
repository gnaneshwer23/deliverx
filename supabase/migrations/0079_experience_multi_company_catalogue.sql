-- Phase 3 expansion: multi-company Experience catalogue (≥10 companies).
-- Additive + idempotent. Seeds Healthcare / Education / SaaS / PM scenarios.
-- Planner never assigns capability — Experience → ledger → ScoreRun remains the write path.
-- Keeps legacy MediFlow emphasis slugs published for existing plans.

do $$
declare
  v_id uuid;
begin
  select fv.id into v_id
  from public.pi_cf_framework_versions fv
  join public.pi_cf_frameworks f on f.id = fv.framework_id
  where f.slug = 'pm-core'
    and fv.version = '2026.1'
    and fv.status in ('published', 'deprecated')
  limit 1;

  insert into public.experience_scenarios (
    slug, title, company_key, project_key, emphasis,
    framework_slug, framework_version, framework_version_id,
    competency_codes, prompt_version, summary, coaching_focus,
    decision_emphasis, status, metadata
  ) values
    (
      'mediflow-trustcare',
      'MediFlow — TrustCare pilot commitment',
      'mediflow', 'trustcare', 'balanced',
      'pm-core', '2026.1', v_id,
      array['comp.stakeholder_management','comp.delivery_execution','comp.product_discovery'],
      'experience-plan-v2',
      'Healthcare Day 1: commit or renegotiate TrustCare with Metro Clinic under sales pressure.',
      'Balance fact-gathering, facilitation, and a clear commit-or-renegotiate decision.',
      '["review_context","discuss_options","make_decision"]'::jsonb,
      'published',
      '{"experienceKey":"mediflow_trustcare_v1","day":1,"industry":"healthcare","companyName":"MediFlow","candidateRole":"Associate Product Manager","engine":"mediflow","fallback":true,"problem":"Sales floated a TrustCare pilot date before engineering confirmed capacity."}'::jsonb
    ),
    (
      'vitalsync-ehr-rollout',
      'VitalSync — EHR cutover sequencing',
      'vitalsync', 'ehr-rollout', 'delivery',
      'pm-core', '2026.1', v_id,
      array['comp.delivery_execution','comp.stakeholder_management'],
      'experience-plan-v2',
      'Healthcare: sequence a hospital EHR go-live under board pressure without unsafe cutover.',
      'Protect dry-run quality and clinical sign-off before any public date.',
      '["review_context","make_decision","discuss_options"]'::jsonb,
      'published',
      '{"experienceKey":"vitalsync_ehr_rollout_v1","day":1,"industry":"healthcare","companyName":"VitalSync","candidateRole":"Product Manager","engine":"shared","problem":"Board wants a hard EHR go-live date while dry-runs and night-shift training are red."}'::jsonb
    ),
    (
      'carebridge-referral',
      'CareBridge — referral network pilot',
      'carebridge', 'referral-pilot', 'stakeholder',
      'pm-core', '2026.1', v_id,
      array['comp.stakeholder_management','comp.product_discovery'],
      'experience-plan-v2',
      'Healthcare: launch a referral network pilot with honest partner SLAs.',
      'Protect the public narrative without overstating live partner readiness.',
      '["discuss_options","make_decision","review_context"]'::jsonb,
      'published',
      '{"experienceKey":"carebridge_referral_v1","day":1,"industry":"healthcare","companyName":"CareBridge","candidateRole":"Technical Product Manager","engine":"shared","problem":"Partnerships wants five live partners for press while APIs are still sandbox."}'::jsonb
    ),
    (
      'brightpath-adaptive',
      'BrightPath — adaptive learning MVP',
      'brightpath', 'adaptive-mvp', 'discovery',
      'pm-core', '2026.1', v_id,
      array['comp.product_discovery','comp.delivery_execution'],
      'experience-plan-v2',
      'Education: scope an adaptive learning MVP without overclaiming outcomes.',
      'Separate evidence-backed MVP scope from demo narrative pressure.',
      '["review_context","discuss_options","make_decision"]'::jsonb,
      'published',
      '{"experienceKey":"brightpath_adaptive_v1","day":1,"industry":"education","companyName":"BrightPath Academy","candidateRole":"Education Product Manager","engine":"shared","problem":"Growth demo claims multi-subject AI tutoring while only one strand is ready."}'::jsonb
    ),
    (
      'campusflow-onboarding',
      'CampusFlow — student intake go-live',
      'campusflow', 'student-onboarding', 'delivery',
      'pm-core', '2026.1', v_id,
      array['comp.delivery_execution','comp.stakeholder_management'],
      'experience-plan-v2',
      'Education: recover a university onboarding release before hard intake.',
      'Protect payment critical path before housing niceties; rewrite parent comms.',
      '["review_context","make_decision","discuss_options"]'::jsonb,
      'published',
      '{"experienceKey":"campusflow_onboarding_v1","day":1,"industry":"education","companyName":"CampusFlow","candidateRole":"Project Manager","engine":"shared","problem":"Housing self-serve was marketed while the payment critical path slipped."}'::jsonb
    ),
    (
      'scholarlink-portal',
      'ScholarLink — research portal redesign',
      'scholarlink', 'portal-redesign', 'discovery',
      'pm-core', '2026.1', v_id,
      array['comp.product_discovery','comp.stakeholder_management'],
      'experience-plan-v2',
      'Education: prioritise discovery before a research-portal vendor kickoff.',
      'Keep grant submission out of cosmetic scope; delay full IA rewrite.',
      '["review_context","discuss_options","make_decision"]'::jsonb,
      'published',
      '{"experienceKey":"scholarlink_portal_v1","day":1,"industry":"education","companyName":"ScholarLink","candidateRole":"Product Manager","engine":"shared","problem":"Vendor kickoff is booked before discovery synthesis; grant forms cannot break."}'::jsonb
    ),
    (
      'novadesk-sla',
      'NovaDesk — enterprise SLA commitment',
      'novadesk', 'enterprise-sla', 'stakeholder',
      'pm-core', '2026.1', v_id,
      array['comp.stakeholder_management','comp.delivery_execution'],
      'experience-plan-v2',
      'SaaS: decide an enterprise SLA ask without collapsing the platform roadmap.',
      'Prefer configurable entitlements and dated commitments over custom forks.',
      '["discuss_options","make_decision","review_context"]'::jsonb,
      'published',
      '{"experienceKey":"novadesk_sla_v1","day":1,"industry":"saas","companyName":"NovaDesk","candidateRole":"Associate Product Manager","engine":"shared","problem":"Enterprise renewal demands a custom SLA that would fork the platform."}'::jsonb
    ),
    (
      'pulseboard-launch',
      'PulseBoard — analytics launch pack',
      'pulseboard', 'launch-pack', 'delivery',
      'pm-core', '2026.1', v_id,
      array['comp.delivery_execution','comp.product_discovery'],
      'experience-plan-v2',
      'SaaS: cut an analytics launch pack to green charts before conference.',
      'Cut to demo-critical green charts; protect onboarding TTV as a launch gate.',
      '["review_context","make_decision","discuss_options"]'::jsonb,
      'published',
      '{"experienceKey":"pulseboard_launch_v1","day":1,"industry":"saas","companyName":"PulseBoard","candidateRole":"Product Manager","engine":"shared","problem":"Marketing printed 12 charts while half time out on big tenants before conference."}'::jsonb
    ),
    (
      'latticeops-permissions',
      'LatticeOps — multi-tenant permissions',
      'latticeops', 'permissions-redesign', 'discovery',
      'pm-core', '2026.1', v_id,
      array['comp.product_discovery','comp.delivery_execution'],
      'experience-plan-v2',
      'SaaS: scope a multi-tenant permissions redesign under audit pressure.',
      'Map critical surfaces; require migration tooling before legacy cutover.',
      '["review_context","discuss_options","make_decision"]'::jsonb,
      'published',
      '{"experienceKey":"latticeops_permissions_v1","day":1,"industry":"saas","companyName":"LatticeOps","candidateRole":"Technical Product Manager","engine":"shared","problem":"Audit findings demand a permissions redesign while Product resists a feature freeze."}'::jsonb
    ),
    (
      'roadmaphq-cut',
      'RoadmapHQ — Q3 roadmap cut',
      'roadmaphq', 'q3-cut', 'stakeholder',
      'pm-core', '2026.1', v_id,
      array['comp.stakeholder_management','comp.product_discovery'],
      'experience-plan-v2',
      'Product management: lead a transparent Q3 roadmap cut under board pressure.',
      'Make capacity visible; renegotiate sold work — do not hide cuts.',
      '["discuss_options","make_decision","review_context"]'::jsonb,
      'published',
      '{"experienceKey":"roadmaphq_cut_v1","day":1,"industry":"product_management","companyName":"RoadmapHQ","candidateRole":"Senior Product Manager","engine":"shared","problem":"Board wants a ruthless cut while Sales already sold two over-capacity epics."}'::jsonb
    ),
    (
      'sprintforge-recovery',
      'SprintForge — release train recovery',
      'sprintforge', 'release-recovery', 'delivery',
      'pm-core', '2026.1', v_id,
      array['comp.delivery_execution','comp.stakeholder_management'],
      'experience-plan-v2',
      'Project management: recover a red cross-team release train before launch.',
      'Create one critical path; cut WIP visibly; publish honest status.',
      '["review_context","make_decision","discuss_options"]'::jsonb,
      'published',
      '{"experienceKey":"sprintforge_recovery_v1","day":1,"industry":"project_management","companyName":"SprintForge","candidateRole":"Project Manager","engine":"shared","problem":"A public launch date sits on a thrashing multi-team train with no single critical path."}'::jsonb
    ),
    (
      'briefcase-pricing',
      'Briefcase — packaging & pricing cut',
      'briefcase', 'pricing-packaging', 'discovery',
      'pm-core', '2026.1', v_id,
      array['comp.product_discovery','comp.stakeholder_management'],
      'experience-plan-v2',
      'Product management: choose packaging that sales can sell and ops can provision.',
      'Anchor packages in interview jobs; make entitlements and discount policy gates.',
      '["review_context","discuss_options","make_decision"]'::jsonb,
      'published',
      '{"experienceKey":"briefcase_pricing_v1","day":1,"industry":"product_management","companyName":"Briefcase","candidateRole":"Product Manager","engine":"shared","problem":"Sales wants five SKUs while interviews and entitlements support three packages."}'::jsonb
    )
  on conflict (slug) do update set
    title = excluded.title,
    company_key = excluded.company_key,
    project_key = excluded.project_key,
    emphasis = excluded.emphasis,
    framework_version_id = coalesce(excluded.framework_version_id, experience_scenarios.framework_version_id),
    competency_codes = excluded.competency_codes,
    prompt_version = excluded.prompt_version,
    summary = excluded.summary,
    coaching_focus = excluded.coaching_focus,
    decision_emphasis = excluded.decision_emphasis,
    status = excluded.status,
    metadata = excluded.metadata,
    updated_at = now();

  -- Keep legacy MediFlow emphasis variants published for existing plan rows.
  update public.experience_scenarios
  set
    prompt_version = 'experience-plan-v2',
    framework_version_id = coalesce(v_id, framework_version_id),
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
      'legacyEmphasisVariant', true,
      'canonicalSlug', 'mediflow-trustcare',
      'companyName', 'MediFlow',
      'industry', 'healthcare',
      'engine', 'mediflow'
    ),
    updated_at = now()
  where slug in (
    'mediflow-trustcare-stakeholder',
    'mediflow-trustcare-delivery',
    'mediflow-trustcare-discovery',
    'mediflow-trustcare-balanced'
  );

  raise notice '0079: seeded multi-company experience catalogue (framework_version_id=%)', v_id;
end $$;
