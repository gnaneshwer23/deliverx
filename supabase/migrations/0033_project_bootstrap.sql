-- Track GO-triggered workspace bootstrap per project

alter table public.projects
  add column if not exists bootstrap_status text not null default 'pending'
    check (bootstrap_status in ('pending', 'running', 'complete', 'partial', 'skipped')),
  add column if not exists bootstrap_summary jsonb not null default '{}'::jsonb,
  add column if not exists bootstrapped_at timestamptz;

create index if not exists projects_bootstrap_status_idx on public.projects(bootstrap_status);
