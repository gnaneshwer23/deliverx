-- Phase 5 / R-P1-12 — Capability child artefacts are engine-only writes.
-- ScoreRuns were locked in 0095; this closes the residual gap where an
-- authenticated client could still insert own judgements or snapshots under an
-- existing run. Users retain owner reads. Service-role Capability Engine writes
-- continue to bypass RLS. Privacy purge keeps the transaction-local delete
-- bypass used by the existing purge RPC.

drop policy if exists "pi_capability_judgements_insert_own"
  on public.pi_capability_judgements;
drop policy if exists "pi_capability_snapshots_insert_own"
  on public.pi_capability_snapshots;

drop policy if exists "pi_capability_judgements_own"
  on public.pi_capability_judgements;
drop policy if exists "pi_capability_snapshots_own"
  on public.pi_capability_snapshots;
drop policy if exists "pi_capability_judgements_select_own"
  on public.pi_capability_judgements;
drop policy if exists "pi_capability_snapshots_select_own"
  on public.pi_capability_snapshots;

create policy "pi_capability_judgements_select_own"
  on public.pi_capability_judgements
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "pi_capability_snapshots_select_own"
  on public.pi_capability_snapshots
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke insert, update, delete, truncate
  on table public.pi_capability_judgements
  from anon, authenticated;
revoke insert, update, delete, truncate
  on table public.pi_capability_snapshots
  from anon, authenticated;

grant select on table public.pi_capability_judgements to authenticated;
grant select on table public.pi_capability_snapshots to authenticated;

create or replace function public.pi_forbid_capability_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on'
     and tg_op = 'DELETE' then
    return old;
  end if;

  raise exception 'immutable capability artefact: % does not allow %',
    tg_table_name, tg_op
    using errcode = '42501';
end;
$$;

revoke all on function public.pi_forbid_capability_mutation()
  from public, anon, authenticated, service_role;

comment on policy "pi_capability_judgements_select_own"
  on public.pi_capability_judgements is
  'Phase 5: users can read own judgements; Capability Engine service role is the only writer.';
comment on policy "pi_capability_snapshots_select_own"
  on public.pi_capability_snapshots is
  'Phase 5: users can read own snapshots; Capability Engine service role is the only writer.';
comment on function public.pi_forbid_capability_mutation() is
  'Capability child artefacts are append-only; DELETE allowed only inside app.pi_privacy_delete purge transactions.';
