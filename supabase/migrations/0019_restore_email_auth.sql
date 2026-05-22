-- Restore email-based invitation RLS (revert phone invite policies).

drop policy if exists "invitations_invitee_select" on public.invitations;
create policy "invitations_invitee_select" on public.invitations
  for select using (
    email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "invitations_invitee_update" on public.invitations;
create policy "invitations_invitee_update" on public.invitations
  for update using (
    email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and status = 'pending'
  )
  with check (
    email is not null
    and lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "organisations_invitee_select" on public.organisations;
create policy "organisations_invitee_select" on public.organisations
  for select using (
    exists (
      select 1 from public.invitations i
      where i.organisation_id = organisations.id
        and lower(i.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and i.status = 'pending'
    )
  );
