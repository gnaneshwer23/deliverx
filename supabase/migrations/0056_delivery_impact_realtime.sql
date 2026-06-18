-- Sprint H2 — enable Supabase Realtime for delivery impact events (live dashboard refresh)

alter publication supabase_realtime add table public.delivery_impact_events;
