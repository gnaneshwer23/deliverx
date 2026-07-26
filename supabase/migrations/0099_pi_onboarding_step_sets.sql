-- B5 onboarding shape: widen the persisted step vocabulary for the eight-step
-- conversational set while keeping every previously shipped step id valid.
-- Existing rows are untouched; the six-step set remains resumable and is the
-- rollback target for DELIVERX_ONBOARDING_STEP_SET=v1-six-step.

alter table public.pi_onboarding_sessions
  drop constraint if exists pi_onboarding_sessions_current_step_check;

alter table public.pi_onboarding_sessions
  add constraint pi_onboarding_sessions_current_step_check
  check (current_step in (
    'welcome',
    'identity',
    'situation',
    'targets',
    'strengths',
    'evidence',
    'working_style',
    'consent',
    'review',
    'path',
    'completed'
  ));

comment on column public.pi_onboarding_sessions.current_step is
  'Onboarding step id. Superset of all shipped step sets (v1-six-step, v2-conversation); retired ids stay valid so in-progress sessions resume rather than restart.';
