-- San Diego Elementary School Campus Map — Supabase schema
-- Run this in Supabase Dashboard > SQL Editor as the project owner.
-- Do not place a Supabase service_role/secret key in config.js.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null unique,
  role text not null check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.classroom_records (
  record_key text primary key check (char_length(record_key) between 1 and 700),
  building_key text not null check (building_key in ('HB BLDG', 'SB BLDG', 'CASTELO BLDG', 'LIBAN BLDG')),
  floor_key text not null check (floor_key in ('1F', '2F', '3F', '4F')),
  room_name text not null check (char_length(room_name) between 1 and 180),
  record jsonb not null default '{}'::jsonb check (jsonb_typeof(record) = 'object'),
  updated_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now()
);

create index if not exists classroom_records_location_idx
  on public.classroom_records (building_key, floor_key, room_name);

alter table public.profiles enable row level security;
alter table public.classroom_records enable row level security;

-- Profiles: users can read only their own role row. Users cannot change their own role.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
drop policy if exists "profile can read self" on public.profiles;
create policy "profile can read self"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

-- Records: any signed-in account can view; only an account whose protected profile
-- says role='admin' can insert or update. The policy also binds updated_by to that user.
revoke all on table public.classroom_records from anon, authenticated;
grant select, insert, update on table public.classroom_records to authenticated;
drop policy if exists "signed-in users can view classrooms" on public.classroom_records;
create policy "signed-in users can view classrooms"
  on public.classroom_records for select to authenticated
  using (true);

drop policy if exists "admins can insert classroom records" on public.classroom_records;
create policy "admins can insert classroom records"
  on public.classroom_records for insert to authenticated
  with check (
    updated_by = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

drop policy if exists "admins can update classroom records" on public.classroom_records;
create policy "admins can update classroom records"
  on public.classroom_records for update to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  )
  with check (
    updated_by = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

-- No delete grant or delete policy is provided. Book editing/deleting happens inside
-- the room's JSON record and is persisted as an Admin-only UPDATE of that room record.
