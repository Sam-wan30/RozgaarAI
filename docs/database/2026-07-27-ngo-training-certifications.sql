-- Phase 4: NGO training programmes, enrollments, assessments and certificates.
--
-- Worker identities remain worker-owned. NGO/Foundation users may add only
-- organization-scoped training records, and certificate verification is always
-- auditable. These policies assume auth.uid()::text matches organization_members.account_id
-- and rozgaar_worker_profiles.user_id in production.

create extension if not exists pgcrypto;

create table if not exists public.training_programmes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  programme_code text not null,
  description text,
  skill_sector text,
  primary_skill text not null,
  delivery_mode text not null check (delivery_mode in ('in_person', 'online', 'hybrid', 'on_the_job')),
  location_name text,
  city text,
  state text,
  start_date date not null,
  end_date date not null,
  enrolment_start_date date,
  enrolment_end_date date,
  capacity integer check (capacity is null or capacity > 0),
  trainer_name text,
  trainer_member_id uuid references public.organization_members(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'upcoming', 'active', 'completed', 'archived', 'cancelled')),
  duration_hours numeric(8,2) check (duration_hours is null or duration_hours >= 0),
  minimum_attendance_percentage integer not null default 75 check (minimum_attendance_percentage between 0 and 100),
  assessment_required boolean not null default true,
  certificate_enabled boolean not null default true,
  created_by_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint training_programmes_dates_check check (end_date >= start_date),
  constraint training_programmes_enrolment_dates_check check (
    enrolment_start_date is null
    or enrolment_end_date is null
    or enrolment_end_date >= enrolment_start_date
  ),
  unique (organization_id, programme_code)
);

create table if not exists public.programme_enrollments (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.training_programmes(id) on delete restrict,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  worker_profile_id text not null,
  association_id uuid references public.worker_organization_associations(id) on delete set null,
  enrollment_status text not null default 'enrolled' check (enrollment_status in ('invited', 'enrolled', 'in_progress', 'completed', 'withdrawn', 'failed', 'cancelled')),
  enrolled_at timestamptz not null default now(),
  enrolled_by_account_id text,
  completion_status text not null default 'not_started' check (completion_status in ('not_started', 'in_progress', 'completed', 'not_completed')),
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  attendance_percentage integer not null default 0 check (attendance_percentage between 0 and 100),
  job_readiness_status text not null default 'not_assessed' check (job_readiness_status in ('not_assessed', 'needs_support', 'developing', 'job_ready', 'highly_ready')),
  withdrawal_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists programme_enrollments_active_unique
  on public.programme_enrollments(programme_id, worker_profile_id)
  where enrollment_status not in ('withdrawn', 'failed', 'cancelled');

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.training_programmes(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  session_date date not null,
  start_time time,
  end_time time,
  location text,
  trainer_name text,
  session_type text not null default 'classroom' check (session_type in ('classroom', 'practical', 'assessment', 'orientation', 'counselling', 'placement_preparation', 'other')),
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_by_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  programme_id uuid not null references public.training_programmes(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  enrollment_id uuid not null references public.programme_enrollments(id) on delete cascade,
  worker_profile_id text not null,
  attendance_status text not null default 'not_marked' check (attendance_status in ('present', 'absent', 'late', 'excused', 'not_marked')),
  check_in_time timestamptz,
  check_out_time timestamptz,
  remarks text,
  marked_by_account_id text,
  marked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, enrollment_id)
);

create table if not exists public.skill_assessments (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.training_programmes(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  enrollment_id uuid not null references public.programme_enrollments(id) on delete cascade,
  worker_profile_id text not null,
  assessment_title text not null,
  assessment_type text not null default 'practical' check (assessment_type in ('theory', 'practical', 'oral', 'project', 'observation', 'final', 'other')),
  skill_name text not null,
  score numeric(8,2),
  maximum_score numeric(8,2),
  percentage integer check (percentage is null or percentage between 0 and 100),
  grade text,
  result_status text not null default 'pending' check (result_status in ('pending', 'passed', 'needs_improvement', 'failed', 'exempted')),
  assessor_name text,
  assessor_member_id uuid references public.organization_members(id) on delete set null,
  assessment_date date not null default current_date,
  feedback text,
  evidence_url text,
  created_by_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skill_assessments_score_check check (
    score is null or maximum_score is null or (score >= 0 and maximum_score > 0 and score <= maximum_score)
  )
);

create table if not exists public.worker_certificates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  programme_id uuid references public.training_programmes(id) on delete set null,
  enrollment_id uuid references public.programme_enrollments(id) on delete set null,
  worker_profile_id text not null,
  certificate_number text not null unique,
  certificate_title text not null,
  skill_name text not null,
  issue_date date not null,
  expiry_date date,
  credential_url text,
  certificate_file_url text,
  verification_status text not null default 'issued' check (verification_status in ('draft', 'issued', 'pending_verification', 'verified', 'rejected', 'revoked', 'expired')),
  verification_method text not null default 'organization_issued' check (verification_method in ('organization_issued', 'manual_document_check', 'external_registry', 'qr_verification', 'other')),
  share_with_employers boolean not null default false,
  verified_by_account_id text,
  verified_at timestamptz,
  revoked_at timestamptz,
  revocation_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  programme_id uuid references public.training_programmes(id) on delete set null,
  enrollment_id uuid references public.programme_enrollments(id) on delete set null,
  worker_profile_id text,
  actor_account_id text,
  activity_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists training_programmes_org_status_idx on public.training_programmes(organization_id, status, start_date desc);
create index if not exists programme_enrollments_org_programme_idx on public.programme_enrollments(organization_id, programme_id, enrollment_status);
create index if not exists programme_enrollments_worker_idx on public.programme_enrollments(worker_profile_id, updated_at desc);
create index if not exists training_sessions_programme_date_idx on public.training_sessions(programme_id, session_date desc);
create index if not exists attendance_records_programme_worker_idx on public.attendance_records(programme_id, worker_profile_id);
create index if not exists skill_assessments_programme_worker_idx on public.skill_assessments(programme_id, worker_profile_id);
create index if not exists worker_certificates_org_status_idx on public.worker_certificates(organization_id, verification_status, issue_date desc);
create index if not exists worker_certificates_worker_idx on public.worker_certificates(worker_profile_id, issue_date desc);
create index if not exists training_activity_logs_org_created_idx on public.training_activity_logs(organization_id, created_at desc);

alter table public.training_programmes enable row level security;
alter table public.programme_enrollments enable row level security;
alter table public.training_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.skill_assessments enable row level security;
alter table public.worker_certificates enable row level security;
alter table public.training_activity_logs enable row level security;

drop policy if exists "NGO members can manage training programmes" on public.training_programmes;
create policy "NGO members can manage training programmes"
on public.training_programmes
for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = training_programmes.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = training_programmes.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
);

drop policy if exists "NGO members can manage enrollments" on public.programme_enrollments;
create policy "NGO members can manage enrollments"
on public.programme_enrollments
for all
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = programme_enrollments.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
)
with check (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = programme_enrollments.organization_id
      and m.status = 'active'
      and m.account_id = auth.uid()::text
  )
  and exists (
    select 1 from public.worker_organization_associations a
    where a.id = programme_enrollments.association_id
      and a.organization_id = programme_enrollments.organization_id
      and a.worker_profile_id = programme_enrollments.worker_profile_id
      and a.association_status = 'linked'
      and a.consent_status = 'granted'
      and a.is_current = true
  )
);

drop policy if exists "NGO members can manage training sessions" on public.training_sessions;
create policy "NGO members can manage training sessions"
on public.training_sessions
for all
using (
  exists (select 1 from public.organization_members m where m.organization_id = training_sessions.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
)
with check (
  exists (select 1 from public.organization_members m where m.organization_id = training_sessions.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
);

drop policy if exists "NGO members can manage attendance" on public.attendance_records;
create policy "NGO members can manage attendance"
on public.attendance_records
for all
using (
  exists (select 1 from public.organization_members m where m.organization_id = attendance_records.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
)
with check (
  exists (select 1 from public.organization_members m where m.organization_id = attendance_records.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
);

drop policy if exists "NGO members can manage assessments" on public.skill_assessments;
create policy "NGO members can manage assessments"
on public.skill_assessments
for all
using (
  exists (select 1 from public.organization_members m where m.organization_id = skill_assessments.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
)
with check (
  exists (select 1 from public.organization_members m where m.organization_id = skill_assessments.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
);

drop policy if exists "NGO members can manage organization certificates" on public.worker_certificates;
create policy "NGO members can manage organization certificates"
on public.worker_certificates
for all
using (
  exists (select 1 from public.organization_members m where m.organization_id = worker_certificates.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
)
with check (
  exists (select 1 from public.organization_members m where m.organization_id = worker_certificates.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
);

drop policy if exists "Workers can read their certificates" on public.worker_certificates;
create policy "Workers can read their certificates"
on public.worker_certificates
for select
using (
  exists (
    select 1 from public.rozgaar_worker_profiles p
    where p.worker_id = worker_certificates.worker_profile_id
      and p.user_id = auth.uid()::text
  )
);

drop policy if exists "Workers can read their training enrollments" on public.programme_enrollments;
create policy "Workers can read their training enrollments"
on public.programme_enrollments
for select
using (
  exists (
    select 1 from public.rozgaar_worker_profiles p
    where p.worker_id = programme_enrollments.worker_profile_id
      and p.user_id = auth.uid()::text
  )
);

drop policy if exists "NGO members can read training activity" on public.training_activity_logs;
create policy "NGO members can read training activity"
on public.training_activity_logs
for select
using (
  exists (select 1 from public.organization_members m where m.organization_id = training_activity_logs.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
);

drop policy if exists "NGO members can create training activity" on public.training_activity_logs;
create policy "NGO members can create training activity"
on public.training_activity_logs
for insert
with check (
  exists (select 1 from public.organization_members m where m.organization_id = training_activity_logs.organization_id and m.status = 'active' and m.account_id = auth.uid()::text)
);
