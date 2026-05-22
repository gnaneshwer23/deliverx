-- Phone authentication: users and invitations keyed by phone, not email.

alter table public.users add column if not exists phone text;
alter table public.users alter column email drop not null;

create unique index if not exists users_phone_unique_idx
  on public.users (phone) where phone is not null;

alter table public.invitations add column if not exists phone text;
alter table public.invitations alter column email drop not null;

create index if not exists invitations_phone_idx on public.invitations (phone);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, phone, name)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(
      new.raw_user_meta_data->>'name',
      new.phone,
      nullif(split_part(coalesce(new.email, ''), '@', 1), '')
    )
  )
  on conflict (id) do update set
    phone = coalesce(excluded.phone, public.users.phone),
    email = coalesce(excluded.email, public.users.email),
    name = coalesce(excluded.name, public.users.name);
  return new;
end;
$$;

-- Invitee RLS: match authenticated user's phone from JWT
drop policy if exists "invitations_invitee_select" on public.invitations;
create policy "invitations_invitee_select" on public.invitations
  for select using (
    phone is not null
    and phone = coalesce(auth.jwt() ->> 'phone', '')
  );

drop policy if exists "invitations_invitee_update" on public.invitations;
create policy "invitations_invitee_update" on public.invitations
  for update using (
    phone is not null
    and phone = coalesce(auth.jwt() ->> 'phone', '')
    and status = 'pending'
  )
  with check (
    phone is not null
    and phone = coalesce(auth.jwt() ->> 'phone', '')
  );

drop policy if exists "organisations_invitee_select" on public.organisations;
create policy "organisations_invitee_select" on public.organisations
  for select using (
    exists (
      select 1 from public.invitations i
      where i.organisation_id = organisations.id
        and i.phone = coalesce(auth.jwt() ->> 'phone', '')
        and i.status = 'pending'
    )
  );
