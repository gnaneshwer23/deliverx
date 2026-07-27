-- Phase 5 follow-up — remove leftover anon table grants on capability child artefacts.
-- RLS already has no anon policy here; this keeps grants aligned with the
-- intended posture: authenticated owner reads only, service-role writes only.

revoke select
  on table public.pi_capability_judgements
  from anon;
revoke select
  on table public.pi_capability_snapshots
  from anon;

comment on table public.pi_capability_judgements is
  'Capability child artefact: authenticated owner SELECT only; service-role Capability Engine writes only.';
comment on table public.pi_capability_snapshots is
  'Capability child artefact: authenticated owner SELECT only; service-role Capability Engine writes only.';
