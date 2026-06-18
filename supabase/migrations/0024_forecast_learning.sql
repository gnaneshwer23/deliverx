-- Phase 4 — structured forecast persistence for learning / eval

alter table public.delivery_forecasts
  add column if not exists expected_date date,
  add column if not exists delay_days int,
  add column if not exists confidence numeric(3, 2);
