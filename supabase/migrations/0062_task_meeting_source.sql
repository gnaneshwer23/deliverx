-- H3 — Link tasks to meeting source when created from approved standup proposals

alter table public.tasks
  add column if not exists source text,
  add column if not exists source_id uuid references public.meetings(id) on delete set null;

create index if not exists tasks_meeting_source_idx on public.tasks(source, source_id)
  where source is not null;

create index if not exists tasks_assignee_source_idx on public.tasks(assignee_id, source)
  where source = 'meeting';
