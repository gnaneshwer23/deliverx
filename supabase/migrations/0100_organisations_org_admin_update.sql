-- B8: Pilot admin PATCH /api/org/config requires org admins (pm | executive)
-- to update their organisation. Legacy policy only allowed created_by = auth.uid(),
-- so non-creator admins (and orgs with null created_by) got PGRST116 / 0-row updates.
-- Reuse is_org_admin() from 0093. Also align projects UPDATE with the same gate
-- so executive org-admins can edit pilot project config (previously pm-only).

drop policy if exists "organisations_admin_update" on public.organisations;
create policy "organisations_admin_update" on public.organisations
  for update
  using (
    id = public.current_org_id()
    and public.is_org_admin()
  )
  with check (
    id = public.current_org_id()
    and public.is_org_admin()
  );

comment on policy "organisations_admin_update" on public.organisations is
  'B8: org admins (pm|executive) may update their current organisation config fields.';

drop policy if exists "projects_creator_update" on public.projects;
create policy "projects_creator_update" on public.projects
  for update
  using (
    organisation_id = public.current_org_id()
    and (
      created_by = auth.uid()
      or public.is_org_admin()
    )
  )
  with check (
    organisation_id = public.current_org_id()
    and (
      created_by = auth.uid()
      or public.is_org_admin()
    )
  );

comment on policy "projects_creator_update" on public.projects is
  'Creator or org admin (pm|executive) may update projects in their organisation.';
