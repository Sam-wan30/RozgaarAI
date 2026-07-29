-- RozgaarAI NGO/Foundation core architecture.
--
-- Production identity note:
-- The current frontend can authenticate with Firebase and stores Firebase uid
-- values as text account ids. Supabase RLS policies below assume auth.uid()::text
-- matches rozgaar_accounts.id/account_id. If production keeps Firebase Auth,
-- issue Supabase-compatible JWTs or map Firebase uid values to Supabase users
-- before relying on these policies. Do not disable RLS for production.

create extension if not exists pgcrypto;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organization_type text not null,
  registration_number text,
  official_email text not null,
  phone text not null,
  website text,
  contact_person_name text not null,
  description text,
  logo_url text,
  headquarters_city text,
  headquarters_state text,
  headquarters_country text default 'India',
  locations_served jsonb not null default '[]'::jsonb,
  skill_sectors jsonb not null default '[]'::jsonb,
  approximate_workers_trained integer not null default 0 check (approximate_workers_trained >= 0),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  onboarding_completed boolean not null default false,
  created_by_account_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  account_id text not null,
  role text not null default 'organization_admin'
    check (role in ('organization_admin', 'programme_manager', 'placement_coordinator', 'trainer', 'viewer')),
  status text not null default 'active'
    check (status in ('invited', 'active', 'suspended', 'removed')),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, account_id)
);

create table if not exists worker_organization_associations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  worker_profile_id text not null,
  association_status text not null default 'invited'
    check (association_status in ('invited', 'pending', 'linked', 'limited', 'revoked', 'former')),
  consent_status text not null default 'not_requested'
    check (consent_status in ('not_requested', 'pending', 'granted', 'revoked', 'declined')),
  consent_requested_at timestamptz,
  consent_granted_at timestamptz,
  consent_revoked_at timestamptz,
  linked_at timestamptz,
  linked_by_account_id text,
  organization_worker_reference text,
  is_current boolean not null default true,
  access_level text not null default 'limited'
    check (access_level in ('limited', 'profile', 'training', 'placement', 'full_support')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists worker_organization_current_unique
  on worker_organization_associations(organization_id, worker_profile_id)
  where is_current = true and association_status not in ('revoked', 'former');

create table if not exists organization_activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_account_id text,
  worker_profile_id text,
  activity_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists organizations_created_by_idx on organizations(created_by_account_id);
create index if not exists organization_members_account_idx on organization_members(account_id);
create index if not exists organization_members_org_idx on organization_members(organization_id);
create index if not exists worker_org_assoc_org_idx on worker_organization_associations(organization_id);
create index if not exists worker_org_assoc_worker_idx on worker_organization_associations(worker_profile_id);
create index if not exists organization_activity_org_created_idx on organization_activity_logs(organization_id, created_at desc);

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table worker_organization_associations enable row level security;
alter table organization_activity_logs enable row level security;

drop policy if exists "Organization members can view their organization" on organizations;
drop policy if exists "Organization admins can update their organization" on organizations;
drop policy if exists "Authenticated users can create their organization" on organizations;

create policy "Organization members can view their organization"
on organizations
for select
using (
  exists (
    select 1 from organization_members members
    where members.organization_id = organizations.id
      and members.account_id = auth.uid()::text
      and members.status = 'active'
  )
);

create policy "Organization admins can update their organization"
on organizations
for update
using (
  exists (
    select 1 from organization_members members
    where members.organization_id = organizations.id
      and members.account_id = auth.uid()::text
      and members.role = 'organization_admin'
      and members.status = 'active'
  )
)
with check (
  exists (
    select 1 from organization_members members
    where members.organization_id = organizations.id
      and members.account_id = auth.uid()::text
      and members.role = 'organization_admin'
      and members.status = 'active'
  )
);

create policy "Authenticated users can create their organization"
on organizations
for insert
with check (created_by_account_id = auth.uid()::text);

drop policy if exists "Members can view organization memberships" on organization_members;
drop policy if exists "Organization admins can manage memberships" on organization_members;
drop policy if exists "Users can create own admin membership" on organization_members;

create policy "Members can view organization memberships"
on organization_members
for select
using (
  account_id = auth.uid()::text
  or exists (
    select 1 from organization_members viewer
    where viewer.organization_id = organization_members.organization_id
      and viewer.account_id = auth.uid()::text
      and viewer.status = 'active'
  )
);

create policy "Organization admins can manage memberships"
on organization_members
for update
using (
  exists (
    select 1 from organization_members admin_member
    where admin_member.organization_id = organization_members.organization_id
      and admin_member.account_id = auth.uid()::text
      and admin_member.role = 'organization_admin'
      and admin_member.status = 'active'
  )
)
with check (
  exists (
    select 1 from organization_members admin_member
    where admin_member.organization_id = organization_members.organization_id
      and admin_member.account_id = auth.uid()::text
      and admin_member.role = 'organization_admin'
      and admin_member.status = 'active'
  )
);

create policy "Users can create own admin membership"
on organization_members
for insert
with check (account_id = auth.uid()::text);

drop policy if exists "Organization members can view associations" on worker_organization_associations;
drop policy if exists "Workers can view their associations" on worker_organization_associations;
drop policy if exists "Organization members can create associations" on worker_organization_associations;
drop policy if exists "Organization members can update associations" on worker_organization_associations;
drop policy if exists "Workers can revoke their own associations" on worker_organization_associations;

create policy "Organization members can view associations"
on worker_organization_associations
for select
using (
  exists (
    select 1 from organization_members members
    where members.organization_id = worker_organization_associations.organization_id
      and members.account_id = auth.uid()::text
      and members.status = 'active'
  )
);

create policy "Workers can view their associations"
on worker_organization_associations
for select
using (
  exists (
    select 1 from rozgaar_worker_profiles profiles
    where profiles.worker_id = worker_organization_associations.worker_profile_id
      and profiles.user_id = auth.uid()::text
  )
);

create policy "Organization members can create associations"
on worker_organization_associations
for insert
with check (
  exists (
    select 1 from organization_members members
    where members.organization_id = worker_organization_associations.organization_id
      and members.account_id = auth.uid()::text
      and members.status = 'active'
  )
);

create policy "Organization members can update associations"
on worker_organization_associations
for update
using (
  exists (
    select 1 from organization_members members
    where members.organization_id = worker_organization_associations.organization_id
      and members.account_id = auth.uid()::text
      and members.status = 'active'
  )
)
with check (
  exists (
    select 1 from organization_members members
    where members.organization_id = worker_organization_associations.organization_id
      and members.account_id = auth.uid()::text
      and members.status = 'active'
  )
);

create policy "Workers can revoke their own associations"
on worker_organization_associations
for update
using (
  exists (
    select 1 from rozgaar_worker_profiles profiles
    where profiles.worker_id = worker_organization_associations.worker_profile_id
      and profiles.user_id = auth.uid()::text
  )
)
with check (consent_status = 'revoked' and association_status in ('revoked', 'former', 'limited'));

drop policy if exists "Organization members can view activity logs" on organization_activity_logs;
drop policy if exists "Organization members can create activity logs" on organization_activity_logs;

create policy "Organization members can view activity logs"
on organization_activity_logs
for select
using (
  exists (
    select 1 from organization_members members
    where members.organization_id = organization_activity_logs.organization_id
      and members.account_id = auth.uid()::text
      and members.status = 'active'
  )
);

create policy "Organization members can create activity logs"
on organization_activity_logs
for insert
with check (
  exists (
    select 1 from organization_members members
    where members.organization_id = organization_activity_logs.organization_id
      and members.account_id = auth.uid()::text
      and members.status = 'active'
  )
);
