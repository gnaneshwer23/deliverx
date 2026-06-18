-- Sprint G3 — Recall.ai bot metadata on meetings

create type public.meeting_recall_sync_status as enum (
  'idle',
  'pending',
  'syncing',
  'synced',
  'failed'
);

alter table public.meetings
  add column if not exists recall_bot_id text,
  add column if not exists recording_url text,
  add column if not exists sync_status public.meeting_recall_sync_status not null default 'idle';

create index if not exists meetings_recall_bot_idx on public.meetings(recall_bot_id)
  where recall_bot_id is not null;

create index if not exists meetings_sync_status_idx on public.meetings(project_id, sync_status);
