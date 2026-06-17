-- Sprint B3 — meeting intelligence: ceremony types + structured extraction

create type public.meeting_ceremony_type as enum (
  'general',
  'standup',
  'planning',
  'retro',
  'steering',
  'workshop'
);

alter table public.meetings
  add column if not exists ceremony_type public.meeting_ceremony_type not null default 'general',
  add column if not exists extraction_json jsonb,
  add column if not exists proposals_queued_at timestamptz;

create index if not exists meetings_ceremony_idx on public.meetings(project_id, ceremony_type);
