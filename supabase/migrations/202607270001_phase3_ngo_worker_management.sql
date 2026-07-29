-- Phase 3: NGO worker management, consent and worker linking.
-- Worker identities remain worker-owned. NGO access is always mediated by
-- worker_organization_associations and explicit consent events.

create table if not exists public.worker_organization_consent_events (
  id text primary key,
  association_id text not null,
  organization_id text not null,
  worker_profile_id text not null,
  event_type text not null check (event_type in ('requested', 'granted', 'declined', 'updated', 'revoked', 'expired')),
  access_level text not null check (access_level in ('basic_support', 'profile_assistance', 'training_and_placement')),
  permissions jsonb not null default '[]'::jsonb,
  consent_version text not null,
  actor_account_id text,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_worker_notes (
  id text primary key,
  organization_id text not null,
  worker_profile_id text not null,
  association_id text not null,
  author_account_id text,
  note_type text not null default 'general' check (note_type in ('general', 'profile_assistance', 'training', 'placement', 'document_follow_up', 'worker_contact', 'employment_follow_up')),
  content text not null,
  visibility text not null default 'organization_only' check (visibility in ('organization_only', 'worker_visible')),
  follow_up_date date,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worker_requests (
  id text primary key,
  worker_profile_id text not null,
  organization_id text not null,
  association_id text not null,
  request_type text not null check (request_type in ('organization_invitation', 'profile_change_request', 'consent_update', 'document_request', 'follow_up')),
  title text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed', 'cancelled', 'expired')),
  action_url text,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  responded_at timestamptz
);

create table if not exists public.assisted_worker_drafts (
  id text primary key,
  organization_id text not null,
  assigned_ngo_member_id text,
  worker_name text not null,
  contact_method text not null default 'phone',
  contact_value text not null,
  preferred_language text not null default 'en',
  city text not null,
  primary_skill text not null,
  experience text,
  employment_preference text,
  availability text,
  expected_wage text,
  draft_status text not null default 'draft' check (draft_status in ('draft', 'worker_verification_pending', 'account_created', 'expired', 'cancelled')),
  consent_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  expiry_date timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.worker_profile_change_requests (
  id text primary key,
  organization_id text not null,
  worker_profile_id text not null,
  association_id text not null,
  requested_by_account_id text,
  changes jsonb not null default '{}'::jsonb,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

alter table public.worker_organization_consent_events enable row level security;
alter table public.organization_worker_notes enable row level security;
alter table public.worker_requests enable row level security;
alter table public.assisted_worker_drafts enable row level security;
alter table public.worker_profile_change_requests enable row level security;

-- Policies assume rozgaar_accounts.id is available through auth.uid() mapping
-- in production. Keep these names stable so production Supabase can tighten the
-- exact account-id expression if the auth mapping differs.

drop policy if exists "NGO members can read consent events for their organization" on public.worker_organization_consent_events;
create policy "NGO members can read consent events for their organization"
on public.worker_organization_consent_events
for select
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = worker_organization_consent_events.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
);

drop policy if exists "NGO members can manage organization notes" on public.organization_worker_notes;
create policy "NGO members can manage organization notes"
on public.organization_worker_notes
for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_worker_notes.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_worker_notes.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
);

drop policy if exists "Workers can read their own requests" on public.worker_requests;
create policy "Workers can read their own requests"
on public.worker_requests
for select
using (
  exists (
    select 1 from public.rozgaar_worker_profiles p
    where p.worker_id = worker_requests.worker_profile_id
      and p.user_id = auth.uid()::text
  )
);

drop policy if exists "NGO members can create worker requests for their organization" on public.worker_requests;
create policy "NGO members can create worker requests for their organization"
on public.worker_requests
for insert
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = worker_requests.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
);

drop policy if exists "NGO members can manage assisted drafts" on public.assisted_worker_drafts;
create policy "NGO members can manage assisted drafts"
on public.assisted_worker_drafts
for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = assisted_worker_drafts.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = assisted_worker_drafts.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
);

create index if not exists idx_consent_events_org_worker on public.worker_organization_consent_events (organization_id, worker_profile_id, created_at desc);
create index if not exists idx_org_worker_notes_scope on public.organization_worker_notes (organization_id, worker_profile_id, created_at desc);
create index if not exists idx_worker_requests_worker_status on public.worker_requests (worker_profile_id, status, created_at desc);
create index if not exists idx_assisted_drafts_org_status on public.assisted_worker_drafts (organization_id, draft_status, updated_at desc);
