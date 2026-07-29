-- Phase 5: NGO placement workflow, employer connections and job opportunities.
-- Worker identity remains worker-owned. NGO records are organization-scoped and
-- employer/worker visibility must be mediated through application policies.

create table if not exists employer_job_opportunities (
  id text primary key,
  employer_account_id text,
  employer_profile_id text not null,
  employer_name text,
  title text not null,
  job_code text,
  description text,
  skill_sector text,
  required_skills text[] default '{}',
  preferred_skills text[] default '{}',
  location_city text,
  location_state text,
  work_location_type text default 'on_site',
  employment_type text default 'full_time',
  shift_type text default 'day',
  minimum_experience_years numeric default 0,
  maximum_experience_years numeric default 0,
  salary_min numeric default 0,
  salary_max numeric default 0,
  salary_period text default 'month',
  open_positions integer default 1,
  filled_positions integer default 0,
  application_deadline date,
  joining_date date,
  accommodation_available boolean default false,
  meals_available boolean default false,
  transport_available boolean default false,
  gender_preference text,
  verification_status text default 'unverified',
  status text default 'open',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists worker_job_recommendations (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  job_id text not null references employer_job_opportunities(id) on delete cascade,
  worker_profile_id text not null,
  association_id text references worker_organization_associations(id) on delete set null,
  recommended_by_account_id text,
  recommendation_status text default 'draft',
  worker_consent_status text default 'pending',
  worker_consent_requested_at timestamptz,
  worker_consent_granted_at timestamptz,
  profile_snapshot jsonb default '{}'::jsonb,
  shared_fields text[] default '{}',
  match_score numeric default 0,
  match_explanation text,
  match_factors jsonb default '{}'::jsonb,
  organization_note text,
  internal_note text,
  worker_note text,
  recommended_at timestamptz,
  responded_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists worker_job_recommendations_one_active
  on worker_job_recommendations (organization_id, job_id, worker_profile_id)
  where recommendation_status not in ('not_selected', 'withdrawn', 'expired', 'closed');

create table if not exists placement_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  job_id text not null references employer_job_opportunities(id) on delete cascade,
  worker_profile_id text not null,
  recommendation_id text references worker_job_recommendations(id) on delete set null,
  employer_profile_id text,
  placement_status text default 'recommended',
  source text default 'ngo_recommendation',
  selected_at timestamptz,
  offer_date date,
  offered_salary numeric default 0,
  salary_period text default 'month',
  joining_date date,
  actual_joining_date date,
  employment_type text,
  work_location text,
  probation_end_date date,
  employment_verified_by_employer boolean default false,
  employment_verified_at timestamptz,
  ended_at timestamptz,
  end_reason text,
  created_by_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists placement_status_history (
  id text primary key,
  placement_id text not null references placement_records(id) on delete cascade,
  organization_id text not null references organizations(id) on delete cascade,
  job_id text,
  worker_profile_id text,
  previous_status text,
  new_status text not null,
  changed_by_account_id text,
  change_reason text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists interview_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  job_id text references employer_job_opportunities(id) on delete cascade,
  worker_profile_id text not null,
  recommendation_id text references worker_job_recommendations(id) on delete set null,
  placement_id text references placement_records(id) on delete set null,
  employer_profile_id text,
  interview_type text default 'phone',
  scheduled_date date,
  start_time time,
  end_time time,
  location text,
  meeting_link text,
  contact_person text,
  status text default 'scheduled',
  worker_confirmed boolean default false,
  employer_confirmed boolean default false,
  outcome text default 'pending',
  feedback_summary text,
  created_by_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists placement_follow_ups (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  placement_id text not null references placement_records(id) on delete cascade,
  worker_profile_id text not null,
  employer_profile_id text,
  follow_up_type text default 'custom',
  scheduled_for date not null,
  completed_at timestamptz,
  status text default 'scheduled',
  worker_status text,
  employment_status text,
  salary_confirmed boolean default false,
  salary_amount numeric default 0,
  salary_period text default 'month',
  worker_satisfaction text,
  employer_satisfaction text,
  issue_category text default 'none',
  notes text,
  next_action text,
  created_by_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists employer_organization_connections (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  employer_profile_id text not null,
  employer_name text,
  industry text,
  location_city text,
  verification_status text default 'unverified',
  connection_status text default 'prospect',
  first_contacted_at timestamptz,
  connected_at timestamptz,
  last_activity_at timestamptz,
  relationship_owner_account_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists employer_organization_connections_unique
  on employer_organization_connections (organization_id, employer_profile_id);

create table if not exists placement_activity_logs (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  worker_profile_id text,
  job_id text,
  recommendation_id text,
  placement_id text,
  interview_id text,
  actor_account_id text,
  activity_type text not null,
  description text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists offer_records (
  id text primary key,
  organization_id text not null references organizations(id) on delete cascade,
  placement_id text not null references placement_records(id) on delete cascade,
  worker_profile_id text not null,
  employer_profile_id text,
  offered_role text,
  offered_salary numeric,
  salary_period text default 'month',
  joining_date date,
  employment_type text,
  work_location text,
  benefits jsonb default '{}'::jsonb,
  worker_response text default 'pending',
  created_by_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employer_job_opportunities_status_idx on employer_job_opportunities(status, verification_status);
create index if not exists worker_job_recommendations_org_idx on worker_job_recommendations(organization_id, recommendation_status);
create index if not exists placement_records_org_idx on placement_records(organization_id, placement_status);
create index if not exists interview_records_org_idx on interview_records(organization_id, scheduled_date);
create index if not exists placement_follow_ups_due_idx on placement_follow_ups(organization_id, status, scheduled_for);
create index if not exists placement_activity_logs_org_idx on placement_activity_logs(organization_id, created_at desc);

alter table employer_job_opportunities enable row level security;
alter table worker_job_recommendations enable row level security;
alter table placement_records enable row level security;
alter table placement_status_history enable row level security;
alter table interview_records enable row level security;
alter table placement_follow_ups enable row level security;
alter table employer_organization_connections enable row level security;
alter table placement_activity_logs enable row level security;
alter table offer_records enable row level security;

-- Concrete RLS policies should bind to the production auth/account mapping.
-- Required policy intent:
-- 1. NGOs can view and mutate only their organization-scoped placement records.
-- 2. Employers can view recommendations and interviews tied to their own jobs.
-- 3. Workers can view recommendations, offers and placements involving themselves.
-- 4. Pending consent must not expose a private profile snapshot to employers.
-- 5. Activity and status history are append-only except for privileged service roles.
