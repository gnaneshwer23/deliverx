-- Phase 2: enable Supabase Realtime for intelligence snapshot tables

alter publication supabase_realtime add table public.coordination_runs;
alter publication supabase_realtime add table public.twin_snapshots;
