/*
 * Marketplace schema for inspection reports tied to a property or site.
 * Matches the live Supabase tables shown in the project dashboard and adds
 * purchase entitlements plus private report-file storage.
 */

create extension if not exists "uuid-ossp" with schema extensions;

create table if not exists public.assets (
  id uuid primary key default extensions.uuid_generate_v4(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  location_identifier text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default extensions.uuid_generate_v4(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  provider_id uuid not null references auth.users(id) on delete cascade,
  price numeric(10, 2) not null check (price > 0),
  file_path text not null,
  legal_rights_confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default extensions.uuid_generate_v4(),
  report_id uuid not null references public.reports(id) on delete cascade,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  amount_paid numeric(10, 2) not null check (amount_paid >= 0),
  created_at timestamptz not null default now(),
  unique (report_id, buyer_id)
);

alter table public.assets
  alter column id set default extensions.uuid_generate_v4(),
  alter column created_at set default now();

alter table public.reports
  alter column id set default extensions.uuid_generate_v4(),
  alter column legal_rights_confirmed set default false,
  alter column created_at set default now();

alter table public.purchases
  alter column id set default extensions.uuid_generate_v4(),
  alter column created_at set default now();

create index if not exists assets_owner_id_idx on public.assets(owner_id);
create index if not exists assets_location_identifier_idx
  on public.assets using gin (to_tsvector('simple', location_identifier));
create index if not exists reports_asset_id_idx on public.reports(asset_id);
create index if not exists reports_provider_id_idx on public.reports(provider_id);
create index if not exists reports_created_at_idx on public.reports(created_at desc);
create index if not exists purchases_report_id_idx on public.purchases(report_id);
create index if not exists purchases_buyer_id_idx on public.purchases(buyer_id);

alter table public.assets enable row level security;
alter table public.reports enable row level security;
alter table public.purchases enable row level security;

grant select, insert, update, delete on table public.assets to authenticated, service_role;
grant select, insert, update, delete on table public.reports to authenticated, service_role;
grant select, insert, update, delete on table public.purchases to authenticated, service_role;

do $policy$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'assets'
      and policyname = 'assets_owner_all'
  ) then
    create policy assets_owner_all on public.assets
      for all to authenticated
      using (owner_id = (select auth.uid()))
      with check (owner_id = (select auth.uid()));
  end if;
end;
$policy$;

do $policy$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'reports'
      and policyname = 'reports_provider_all'
  ) then
    create policy reports_provider_all on public.reports
      for all to authenticated
      using (provider_id = (select auth.uid()))
      with check (provider_id = (select auth.uid()));
  end if;
end;
$policy$;

do $policy$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'purchases'
      and policyname = 'purchases_buyer_select'
  ) then
    create policy purchases_buyer_select on public.purchases
      for select to authenticated
      using (buyer_id = (select auth.uid()));
  end if;
end;
$policy$;

do $policy$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'purchases'
      and policyname = 'purchases_provider_select'
  ) then
    create policy purchases_provider_select on public.purchases
      for select to authenticated
      using (
        exists (
          select 1
          from public.reports
          where reports.id = purchases.report_id
            and reports.provider_id = (select auth.uid())
        )
      );
  end if;
end;
$policy$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'reports',
  'reports',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $policy$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'report_files_provider_all'
  ) then
    create policy report_files_provider_all on storage.objects
      for all to authenticated
      using (
        bucket_id = 'reports'
          and (storage.foldername(name))[1] = (select auth.uid())::text
      )
      with check (
        bucket_id = 'reports'
          and (storage.foldername(name))[1] = (select auth.uid())::text
      );
  end if;
end;
$policy$;
