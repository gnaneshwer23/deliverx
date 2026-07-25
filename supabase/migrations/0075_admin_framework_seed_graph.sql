-- WP5 Phase 1: seed full pm-core@2026.1 graph into pi_cf_*
-- Bootstrap from PM_CORE_RUBRIC_2026_1 + CAREER_ROLE_CATALOGUE parity.
-- Published version from 0074 is immutable — temporarily disable content triggers for one-time seed.

do $$
declare
  v_id uuid;
  n_comp int;
  fam_id uuid;
  sen_assoc uuid;
  sen_mid uuid;
  comp_stake uuid;
  comp_deliv uuid;
  comp_disc uuid;
  ind_stake uuid;
  ind_deliv uuid;
  ind_disc uuid;
  role_apm uuid;
  role_pm uuid;
  t text;
begin
  select fv.id into v_id
  from public.pi_cf_framework_versions fv
  join public.pi_cf_frameworks f on f.id = fv.framework_id
  where f.slug = 'pm-core' and fv.version = '2026.1';

  if v_id is null then
    raise notice 'pm-core@2026.1 framework version missing — skip seed';
    return;
  end if;

  select count(*) into n_comp
  from public.pi_cf_competencies
  where framework_version_id = v_id;

  if n_comp > 0 then
    raise notice 'pm-core@2026.1 already has competencies — skip seed';
    return;
  end if;

  -- Allow bootstrap inserts into published version (one-time)
  foreach t in array array[
    'pi_cf_role_families',
    'pi_cf_seniority_levels',
    'pi_cf_roles',
    'pi_cf_competencies',
    'pi_cf_indicators',
    'pi_cf_rubric_anchors',
    'pi_cf_assessment_content',
    'pi_cf_evidence_rules',
    'pi_cf_portfolio_expectations',
    'pi_cf_readiness_requirements'
  ]
  loop
    execute format('alter table public.%I disable trigger trg_%s_immutable', t, t);
  end loop;

  insert into public.pi_cf_role_families (framework_version_id, slug, title, description, sort_order)
  values (v_id, 'product-management', 'Product Management',
          'Product management role family for Professional Intelligence matching.', 0)
  returning id into fam_id;

  insert into public.pi_cf_seniority_levels (framework_version_id, slug, title, rank)
  values (v_id, 'associate', 'Associate', 1)
  returning id into sen_assoc;

  insert into public.pi_cf_seniority_levels (framework_version_id, slug, title, rank)
  values (v_id, 'mid', 'Mid', 2)
  returning id into sen_mid;

  insert into public.pi_cf_competencies (framework_version_id, code, title, description, sort_order)
  values (v_id, 'comp.stakeholder_management', 'Stakeholder management', '', 0)
  returning id into comp_stake;

  insert into public.pi_cf_competencies (framework_version_id, code, title, description, sort_order)
  values (v_id, 'comp.delivery_execution', 'Delivery execution', '', 1)
  returning id into comp_deliv;

  insert into public.pi_cf_competencies (framework_version_id, code, title, description, sort_order)
  values (v_id, 'comp.product_discovery', 'Product discovery', '', 2)
  returning id into comp_disc;

  insert into public.pi_cf_indicators (
    framework_version_id, competency_id, code, key, title, description, sort_order
  ) values
    (v_id, comp_stake, 'ind.stakeholder_judgement', 'stakeholder_judgement',
     'Stakeholder judgement', '', 0)
  returning id into ind_stake;

  insert into public.pi_cf_indicators (
    framework_version_id, competency_id, code, key, title, description, sort_order
  ) values
    (v_id, comp_deliv, 'ind.delivery_judgement', 'delivery_judgement',
     'Delivery judgement', '', 1)
  returning id into ind_deliv;

  insert into public.pi_cf_indicators (
    framework_version_id, competency_id, code, key, title, description, sort_order
  ) values
    (v_id, comp_disc, 'ind.discovery_practice', 'product_discovery',
     'Discovery practice', '', 2)
  returning id into ind_disc;

  insert into public.pi_cf_rubric_anchors (framework_version_id, indicator_id, level, anchor_text)
  values
    (v_id, ind_stake, 'emerging', 'Identifies stakeholders with prompting'),
    (v_id, ind_stake, 'developing', 'Balances two stakeholder needs with trade-offs'),
    (v_id, ind_stake, 'proficient', 'Navigates conflicting priorities with clear rationale'),
    (v_id, ind_stake, 'advanced', 'Shapes multi-party alignment under ambiguity'),
    (v_id, ind_deliv, 'emerging', 'Tracks tasks'),
    (v_id, ind_deliv, 'developing', 'Sequences work with dependencies'),
    (v_id, ind_deliv, 'proficient', 'Protects outcomes under constraint'),
    (v_id, ind_deliv, 'advanced', 'Recovers delivery with systemic insight'),
    (v_id, ind_disc, 'emerging', 'Restates problems'),
    (v_id, ind_disc, 'developing', 'Forms testable hypotheses'),
    (v_id, ind_disc, 'proficient', 'Validates with evidence before build'),
    (v_id, ind_disc, 'advanced', 'Reframes problem space from outcomes');

  insert into public.pi_cf_roles (
    framework_version_id, role_family_id, seniority_level_id, slug, title, industry_fit, description
  ) values (
    v_id, fam_id, sen_assoc, 'apm-healthtech', 'Associate Product Manager',
    array['Healthtech', 'B2B SaaS'], ''
  )
  returning id into role_apm;

  insert into public.pi_cf_roles (
    framework_version_id, role_family_id, seniority_level_id, slug, title, industry_fit, description
  ) values (
    v_id, fam_id, sen_mid, 'pm-saas', 'Product Manager',
    array['B2B SaaS', 'Fintech', 'Healthtech'], ''
  )
  returning id into role_pm;

  insert into public.pi_cf_assessment_content (
    framework_version_id, kind, slug, title, body, payload,
    competency_ids, indicator_ids, sort_order
  ) values (
    v_id, 'scenario', 'conflicting-stakeholders', 'Conflicting stakeholder asks',
    'Two executives disagree on scope and timeline. Decide how to proceed.',
    '{"source":"pm-core-seed"}'::jsonb,
    array[comp_stake], array[ind_stake], 0
  );

  -- Evidence rules map sources → indicators; assignsCapability must stay false
  insert into public.pi_cf_evidence_rules (
    framework_version_id, slug, title, source_type_hints,
    competency_id, indicator_id, rule, weight
  ) values
    (v_id, 'map-decision-to-stakeholder_judgement',
     'decision evidence maps to Stakeholder judgement',
     array['decision'], comp_stake, ind_stake,
     '{"mapsToIndicatorKey":"stakeholder_judgement","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-meeting-to-stakeholder_judgement',
     'meeting evidence maps to Stakeholder judgement',
     array['meeting'], comp_stake, ind_stake,
     '{"mapsToIndicatorKey":"stakeholder_judgement","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-experience_project-to-delivery_judgement',
     'experience_project evidence maps to Delivery judgement',
     array['experience_project'], comp_deliv, ind_deliv,
     '{"mapsToIndicatorKey":"delivery_judgement","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-artefact-to-product_discovery',
     'artefact evidence maps to Discovery practice',
     array['artefact'], comp_disc, ind_disc,
     '{"mapsToIndicatorKey":"product_discovery","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-work_sample-to-product_discovery',
     'work_sample evidence maps to Discovery practice',
     array['work_sample'], comp_disc, ind_disc,
     '{"mapsToIndicatorKey":"product_discovery","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-reflection-to-product_discovery',
     'reflection evidence maps to Discovery practice',
     array['reflection'], comp_disc, ind_disc,
     '{"mapsToIndicatorKey":"product_discovery","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-application_outcome-to-delivery_judgement',
     'application_outcome evidence maps to Delivery judgement',
     array['application_outcome'], comp_deliv, ind_deliv,
     '{"mapsToIndicatorKey":"delivery_judgement","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-message-to-stakeholder_judgement',
     'message evidence maps to Stakeholder judgement',
     array['message'], comp_stake, ind_stake,
     '{"mapsToIndicatorKey":"stakeholder_judgement","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-launchpad_interview-to-stakeholder_judgement',
     'launchpad_interview evidence maps to Stakeholder judgement',
     array['launchpad_interview'], comp_stake, ind_stake,
     '{"mapsToIndicatorKey":"stakeholder_judgement","assignsCapability":false}'::jsonb, 1),
    (v_id, 'map-external_verification-to-delivery_judgement',
     'external_verification evidence maps to Delivery judgement',
     array['external_verification'], comp_deliv, ind_deliv,
     '{"mapsToIndicatorKey":"delivery_judgement","assignsCapability":false}'::jsonb, 1);

  insert into public.pi_cf_portfolio_expectations (
    framework_version_id, role_id, slug, title, expectation, required
  ) values
    (v_id, role_apm, 'apm-healthtech-decision-log', 'Decision log sample',
     'Include at least one verified decision artefact with provenance.', true),
    (v_id, role_pm, 'pm-saas-decision-log', 'Decision log sample',
     'Include at least one verified decision artefact with provenance.', true);

  -- Readiness: associate → developing; mid → proficient (replaces defaultTargetRequirements hard-codes)
  insert into public.pi_cf_readiness_requirements (
    framework_version_id, role_id, competency_id, min_level, weight
  ) values
    (v_id, role_apm, comp_stake, 'developing', 3),
    (v_id, role_apm, comp_disc, 'developing', 2),
    (v_id, role_apm, comp_deliv, 'developing', 3),
    (v_id, role_pm, comp_stake, 'proficient', 3),
    (v_id, role_pm, comp_deliv, 'proficient', 3),
    (v_id, role_pm, comp_disc, 'proficient', 2);

  insert into public.pi_cf_audit_events (
    framework_version_id, actor_id, action, entity_type, entity_id, after_state, metadata
  ) values (
    v_id, null, 'version.seeded', 'framework_version', v_id,
    '{"status":"published","source":"0075_admin_framework_seed_graph"}'::jsonb,
    '{"note":"Bootstrapped competencies, roles, readiness, evidence rules from in-code catalogue"}'::jsonb
  );

  -- Re-enable immutability triggers
  foreach t in array array[
    'pi_cf_role_families',
    'pi_cf_seniority_levels',
    'pi_cf_roles',
    'pi_cf_competencies',
    'pi_cf_indicators',
    'pi_cf_rubric_anchors',
    'pi_cf_assessment_content',
    'pi_cf_evidence_rules',
    'pi_cf_portfolio_expectations',
    'pi_cf_readiness_requirements'
  ]
  loop
    execute format('alter table public.%I enable trigger trg_%s_immutable', t, t);
  end loop;
end $$;

-- Ensure bridge link to pi_rubric_versions remains set
update public.pi_cf_framework_versions fv
set rubric_version_id = rv.id
from public.pi_cf_frameworks f,
     public.pi_rubric_versions rv
where fv.framework_id = f.id
  and f.slug = 'pm-core'
  and fv.version = '2026.1'
  and rv.slug = 'pm-core'
  and rv.version = '2026.1'
  and fv.rubric_version_id is null;
