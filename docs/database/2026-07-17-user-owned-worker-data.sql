-- RozgaarAI user-owned worker data migration.
-- Run this in Supabase SQL editor after confirming the auth strategy.
--
-- The frontend stores Google/Firebase uid values in user_id. For strict RLS
-- with Supabase Auth, replace the text user_id columns with uuid references
-- to auth.users(id), or issue Supabase-compatible JWTs whose sub equals the
-- Firebase uid. Until then, application code must also filter by user_id.

alter table if exists rozgaar_worker_profiles
  add column if not exists user_id text;

create unique index if not exists rozgaar_worker_profiles_user_id_unique
  on rozgaar_worker_profiles(user_id)
  where user_id is not null;

create index if not exists rozgaar_worker_profiles_user_id_updated_at_idx
  on rozgaar_worker_profiles(user_id, updated_at desc);

-- Keep legacy unowned profiles unassigned. Do not backfill user_id unless the
-- original creator's authenticated uid has been verified.

alter table if exists rozgaar_worker_profiles enable row level security;

drop policy if exists "Users can read their own worker profiles" on rozgaar_worker_profiles;
drop policy if exists "Users can create their own worker profiles" on rozgaar_worker_profiles;
drop policy if exists "Users can update their own worker profiles" on rozgaar_worker_profiles;
drop policy if exists "Users can delete their own worker profiles" on rozgaar_worker_profiles;

create policy "Users can read their own worker profiles"
on rozgaar_worker_profiles
for select
using (auth.uid()::text = user_id);

create policy "Users can create their own worker profiles"
on rozgaar_worker_profiles
for insert
with check (auth.uid()::text = user_id);

create policy "Users can update their own worker profiles"
on rozgaar_worker_profiles
for update
using (auth.uid()::text = user_id)
with check (auth.uid()::text = user_id);

create policy "Users can delete their own worker profiles"
on rozgaar_worker_profiles
for delete
using (auth.uid()::text = user_id);

-- Apply the same ownership field and RLS pattern to optional user-owned tables.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'resumes',
    'income_passports',
    'income_records',
    'applications',
    'saved_jobs',
    'interview_sessions',
    'safety_checks',
    'worker_documents'
  ]
  loop
    if to_regclass(table_name) is not null then
      execute format('alter table %I add column if not exists user_id text', table_name);
      execute format('create index if not exists %I on %I(user_id)', table_name || '_user_id_idx', table_name);
      execute format('alter table %I enable row level security', table_name);

      execute format('drop policy if exists "Users can read their own rows" on %I', table_name);
      execute format('drop policy if exists "Users can create their own rows" on %I', table_name);
      execute format('drop policy if exists "Users can update their own rows" on %I', table_name);
      execute format('drop policy if exists "Users can delete their own rows" on %I', table_name);

      execute format('create policy "Users can read their own rows" on %I for select using (auth.uid()::text = user_id)', table_name);
      execute format('create policy "Users can create their own rows" on %I for insert with check (auth.uid()::text = user_id)', table_name);
      execute format('create policy "Users can update their own rows" on %I for update using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id)', table_name);
      execute format('create policy "Users can delete their own rows" on %I for delete using (auth.uid()::text = user_id)', table_name);
    end if;
  end loop;
end $$;
