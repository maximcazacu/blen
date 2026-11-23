-- Proposed production data boundary. The current runtime uses a separate local SQLite store.
-- Apply only to a disposable Supabase project until the adapter and access tests are complete.
begin;
create schema if not exists flowelix_private;
revoke all on schema flowelix_private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (length(display_name) <= 120),
  locale text not null default 'ro' check (locale in ('ro','en')),
  created_at timestamptz not null default now()
);
create table flowelix_private.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  state text not null check (state in ('draft','published','custom','coming_soon','archived')),
  category text not null,
  validated_at timestamptz
);
create table public.product_translations (
  product_id uuid references public.products(id) on delete cascade,
  locale text check (locale in ('ro','en')), title text not null, description text not null,
  primary key (product_id,locale)
);
create table public.product_versions (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
  version text not null, compatibility text not null, license_notice text not null, unique (product_id,version)
);
create table public.product_prices (
  product_version_id uuid references public.product_versions(id), currency text check (currency in ('EUR','RON')),
  amount_minor integer not null check (amount_minor>0), approved_at timestamptz,
  primary key (product_version_id,currency)
);
create table public.workflows (
  id uuid primary key default gen_random_uuid(), owner uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(name) between 1 and 100), created_at timestamptz not null default now()
);
create index workflows_owner_idx on public.workflows(owner);
create table public.workflow_versions (
  id uuid primary key default gen_random_uuid(), workflow_id uuid not null references public.workflows(id) on delete cascade,
  version integer not null check (version > 0), graph jsonb not null, compiler_version text not null,
  unique (workflow_id,version)
);
create table flowelix_private.artifacts (
  id uuid primary key default gen_random_uuid(), object_key text unique not null,
  content_sha256 text not null, version text not null
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), owner uuid references auth.users(id) on delete set null,
  currency text not null check (currency in ('EUR','RON')), amount_minor integer not null check (amount_minor>0),
  mode text not null check (mode in ('simulation','stripe_test')),
  state text not null check (state in ('pending','paid','failed','cancelled','refunded')),
  invoice_state text not null default 'pending_configuration' check (invoice_state in ('pending_configuration','pending_issuance','issued','reported')),
  created_at timestamptz not null default now()
);
create index orders_owner_idx on public.orders(owner);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
  product_version_id uuid references public.product_versions(id), workflow_version_id uuid references public.workflow_versions(id) on delete set null,
  label text not null, amount_minor integer not null check (amount_minor>0)
);
create table flowelix_private.payment_events (
  provider_event_id text primary key, order_id uuid not null references public.orders(id),
  event_type text not null, created_at timestamptz not null default now()
);
create table public.entitlements (
  id uuid primary key default gen_random_uuid(), owner uuid not null references auth.users(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id), artifact_id uuid not null references flowelix_private.artifacts(id),
  revoked_at timestamptz, unique (owner,order_item_id)
);
create index entitlement_owner_idx on public.entitlements(owner);
create table flowelix_private.download_records (
  id uuid primary key default gen_random_uuid(), entitlement_id uuid references public.entitlements(id) on delete set null,
  created_at timestamptz not null default now()
);
create table public.custom_requests (
  id uuid primary key default gen_random_uuid(), owner uuid references auth.users(id) on delete set null,
  source text not null check (source in ('ops','web')), status text not null default 'new',
  payload jsonb not null, created_at timestamptz not null default now()
);
create index requests_owner_idx on public.custom_requests(owner);
create table public.quotations (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.custom_requests(id) on delete cascade
);
create table public.quotation_versions (
  quotation_id uuid references public.quotations(id) on delete cascade, revision integer check (revision>0),
  scope text not null, milestones text not null, exclusions text not null, amount_minor integer not null check(amount_minor>0),
  currency text not null check (currency in ('EUR','RON')), status text not null check(status in ('draft','proposed','accepted','rejected')),
  primary key (quotation_id,revision)
);
create table flowelix_private.audit_log (
  id uuid primary key default gen_random_uuid(), actor uuid references auth.users(id) on delete set null,
  action text not null, subject uuid not null, created_at timestamptz not null default now()
);

do $$
declare item record;
begin
  for item in select schemaname,tablename from pg_tables where schemaname='flowelix_private' or
    (schemaname='public' and tablename in ('profiles','products','product_translations','product_versions','product_prices',
     'workflows','workflow_versions','orders','order_items','entitlements','custom_requests','quotations','quotation_versions'))
  loop
    execute format('alter table %I.%I enable row level security',item.schemaname,item.tablename);
    execute format('revoke all on table %I.%I from public, anon, authenticated',item.schemaname,item.tablename);
  end loop;
end $$;

grant select on public.profiles,public.workflows,public.workflow_versions,public.orders,public.order_items,public.entitlements,public.custom_requests,public.quotations,public.quotation_versions to authenticated;
grant update (display_name,locale) on public.profiles to authenticated;
create policy own_profile on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy edit_own_profile on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy own_workflows on public.workflows for select to authenticated using (owner=(select auth.uid()));
create policy own_workflow_versions on public.workflow_versions for select to authenticated using (exists(select 1 from public.workflows w where w.id=workflow_id and w.owner=(select auth.uid())));
create policy own_orders on public.orders for select to authenticated using (owner=(select auth.uid()));
create policy own_order_items on public.order_items for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and o.owner=(select auth.uid())));
create policy own_entitlements on public.entitlements for select to authenticated using (owner=(select auth.uid()) and revoked_at is null);
create policy own_requests on public.custom_requests for select to authenticated using (owner=(select auth.uid()));
create policy own_quotes on public.quotations for select to authenticated using (exists(select 1 from public.custom_requests r where r.id=request_id and r.owner=(select auth.uid())));
create policy own_quote_versions on public.quotation_versions for select to authenticated using (status <> 'draft' and exists(select 1 from public.quotations q where q.id=quotation_id));
insert into storage.buckets (id,name,public) values ('flowelix-artifacts','flowelix-artifacts',false);
-- Service-mediated downloads only. A later adapter must verify entitlement before issuing a signed URL.
commit;
