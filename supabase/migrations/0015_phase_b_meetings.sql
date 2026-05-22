-- Phase B — meeting recordings + transcript fields

alter table public.meetings
  add column if not exists transcript text,
  add column if not exists recording_path text;

-- Private bucket for meeting audio/video (uploads via server API)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'meeting-recordings',
  'meeting-recordings',
  false,
  52428800,
  array[
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/webm',
    'audio/x-m4a',
    'audio/mp3',
    'video/mp4'
  ]
)
on conflict (id) do nothing;

-- Service role uploads via API; no direct client storage policies required for MVP.
