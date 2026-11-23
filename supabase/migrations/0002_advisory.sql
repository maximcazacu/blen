-- Apply after the initial Supabase schema. Local previews use SQLite instead.
begin;
alter table public.custom_requests drop constraint custom_requests_source_check;
alter table public.custom_requests add constraint custom_requests_source_check
  check (source in ('ops','web','advisory'));

create table public.advisory_projects (
  request_id uuid primary key references public.custom_requests(id) on delete cascade,
  assigned_service text check (assigned_service in ('process-audit','process-optimization','data-architecture','ai-readiness','systems-integration','continuous-improvement')),
  notes text not null default '' check (length(notes)<=2000),
  milestones text not null default '' check (length(milestones)<=2000)
);
create table public.advisory_deliverables (
  request_id uuid primary key references public.advisory_projects(request_id) on delete cascade,
  title text not null check (length(title) between 1 and 120),
  body text not null check (length(body) between 1 and 6000),
  approved boolean not null default false
);
create table public.advisory_support (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_requests(id) on delete cascade,
  message text not null check (length(message) between 10 and 1500),
  state text not null default 'open' check (state in ('open','reviewing','resolved')),
  created_at timestamptz not null default now()
);
create index advisory_support_request_idx on public.advisory_support(request_id,created_at);
create table public.advisory_quote_costs (
  quotation_id uuid not null,
  revision integer not null,
  consulting integer not null check (consulting>=0),
  implementation integer not null check (implementation>=0),
  licenses integer not null check (licenses>=0),
  hosting integer not null check (hosting>=0),
  maintenance integer not null check (maintenance>=0),
  primary key (quotation_id,revision),
  foreign key (quotation_id,revision) references public.quotation_versions(quotation_id,revision) on delete cascade
);

alter table public.advisory_projects enable row level security;
alter table public.advisory_deliverables enable row level security;
alter table public.advisory_support enable row level security;
alter table public.advisory_quote_costs enable row level security;
revoke all on public.advisory_projects,public.advisory_deliverables,public.advisory_support,public.advisory_quote_costs from public,anon,authenticated;
grant select (request_id,assigned_service,milestones) on public.advisory_projects to authenticated;
grant select on public.advisory_deliverables,public.advisory_support,public.advisory_quote_costs to authenticated;

create policy own_advisory_projects on public.advisory_projects for select to authenticated using (
  exists(select 1 from public.custom_requests r where r.id=request_id and r.source='advisory' and r.owner=(select auth.uid()))
);
create policy own_approved_advisory_deliverables on public.advisory_deliverables for select to authenticated using (
  approved and exists(select 1 from public.custom_requests r where r.id=request_id and r.source='advisory' and r.owner=(select auth.uid()))
);
create policy own_advisory_support on public.advisory_support for select to authenticated using (
  exists(select 1 from public.custom_requests r where r.id=request_id and r.source='advisory' and r.owner=(select auth.uid()))
);
-- Visibility follows the owner and non-draft policies on quotations and quotation_versions.
create policy own_published_advisory_costs on public.advisory_quote_costs for select to authenticated using (
  exists(select 1 from public.quotation_versions v
         where v.quotation_id=advisory_quote_costs.quotation_id and v.revision=advisory_quote_costs.revision and v.status<>'draft')
);
commit;
