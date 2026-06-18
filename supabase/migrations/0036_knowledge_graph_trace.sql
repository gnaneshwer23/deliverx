-- Sprint B1 — extend delivery trace links for full knowledge graph chain

alter table public.requirement_trace_links
  add column if not exists test_case_id uuid references public.test_cases(id) on delete set null;

create index if not exists trace_links_test_case_idx
  on public.requirement_trace_links(test_case_id)
  where test_case_id is not null;

-- benefit_id existed without FK — wire to benefit_hypotheses
do $$ begin
  alter table public.requirement_trace_links
    add constraint requirement_trace_links_benefit_fkey
    foreign key (benefit_id) references public.benefit_hypotheses(id) on delete set null;
exception
  when duplicate_object then null;
end $$;

create index if not exists trace_links_benefit_idx
  on public.requirement_trace_links(benefit_id)
  where benefit_id is not null;
