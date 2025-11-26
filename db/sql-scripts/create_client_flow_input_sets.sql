-- Create table for end-user input presets (client-facing)
create table if not exists public.client_flow_input_sets (
  id uuid primary key default gen_random_uuid(),
  flow_key text not null,
  variant_key text not null,
  name text not null,
  description text,
  tags text[],
  variables jsonb not null,
  is_active boolean not null default true,
  weight int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_client_flow_input_sets_updated_at on public.client_flow_input_sets;
create trigger trg_client_flow_input_sets_updated_at
before update on public.client_flow_input_sets
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.client_flow_input_sets enable row level security;

-- RLS policies
do $$ begin
  -- Select: allow anon but only active rows
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='client_flow_input_sets' and policyname='client_flow_input_sets_select_active'
  ) then
    create policy client_flow_input_sets_select_active on public.client_flow_input_sets
      for select using (is_active = true);
  end if;

  -- Insert/Update/Delete: SuperAdmin only (replace with your admin check as needed)
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='client_flow_input_sets' and policyname='client_flow_input_sets_admin_write'
  ) then
    create policy client_flow_input_sets_admin_write on public.client_flow_input_sets
      for all using (
        auth.role() = 'authenticated'
      ) with check (
        auth.uid() is not null
      );
  end if;
end $$;

-- Seed placeholder rows: keep empty here; provide a separate seed file with 50 entries


