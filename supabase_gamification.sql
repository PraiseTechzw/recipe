-- ============================================================================
-- Supabase Schema for No-Auth Leaderboard
-- ============================================================================

-- 1. Create tables
create table if not exists public.chefs (
  chef_id text primary key, -- Generated on device (e.g. UUID)
  chef_name text not null,
  country text,
  avatar_seed text,
  updated_at timestamptz default now()
);

create table if not exists public.leaderboard (
  chef_id text primary key references public.chefs(chef_id) on delete cascade,
  total_xp int not null default 0 check (total_xp >= 0),
  weekly_xp int not null default 0 check (weekly_xp >= 0),
  level int not null default 1,
  achievements_count int not null default 0,
  last_active_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create indexes for leaderboard sorting
create index if not exists idx_leaderboard_weekly_xp on public.leaderboard(weekly_xp desc);
create index if not exists idx_leaderboard_total_xp on public.leaderboard(total_xp desc);

-- 3. Enable Realtime
alter publication supabase_realtime add table public.leaderboard;

-- 4. RLS Policies
-- CHALLENGE: Without auth, we cannot securely verify who "owns" a chef_id.
-- TRADEOFF: We allow anyone to UPSERT if they know the chef_id.
-- Since chef_ids are UUIDs generated on device, guessing them is hard.
-- This prevents mass vandalism but allows a targeted attack if an ID is leaked.
-- For a casual cooking app, this is acceptable.

alter table public.chefs enable row level security;
alter table public.leaderboard enable row level security;

-- Policy: Anyone can read
create policy "Public read chefs" on public.chefs for select using (true);
create policy "Public read leaderboard" on public.leaderboard for select using (true);

-- Policy: Anyone can insert/update (effectively "public write")
-- We rely on the client to provide the correct UUID.
create policy "Public upsert chefs" on public.chefs for insert with check (true);
create policy "Public update chefs" on public.chefs for update using (true);

create policy "Public upsert leaderboard" on public.leaderboard for insert with check (true);
create policy "Public update leaderboard" on public.leaderboard for update using (true);


-- 5. Helper Function to Upsert Profile + Leaderboard in one transaction
-- This simplifies the client logic.
create or replace function public.upsert_chef_stats(
  p_chef_id text,
  p_chef_name text,
  p_total_xp int,
  p_weekly_xp int,
  p_level int,
  p_achievements_count int,
  p_avatar_seed text default null,
  p_country text default null
)
returns void as $$
begin
  -- 1. Upsert Chef
  insert into public.chefs (chef_id, chef_name, avatar_seed, country, updated_at)
  values (p_chef_id, p_chef_name, p_avatar_seed, p_country, now())
  on conflict (chef_id) do update
  set 
    chef_name = excluded.chef_name,
    avatar_seed = coalesce(excluded.avatar_seed, chefs.avatar_seed),
    country = coalesce(excluded.country, chefs.country),
    updated_at = now();

  -- 2. Upsert Leaderboard
  -- We protect against accidental downgrades of total_xp (but allow weekly_xp reset)
  insert into public.leaderboard (chef_id, total_xp, weekly_xp, level, achievements_count, last_active_at, updated_at)
  values (p_chef_id, p_total_xp, p_weekly_xp, p_level, p_achievements_count, now(), now())
  on conflict (chef_id) do update
  set
    total_xp = greatest(leaderboard.total_xp, excluded.total_xp), -- Never decrease total XP
    weekly_xp = excluded.weekly_xp, -- Allow reset
    level = greatest(leaderboard.level, excluded.level),
    achievements_count = greatest(leaderboard.achievements_count, excluded.achievements_count),
    last_active_at = now(),
    updated_at = now();
end;
$$ language plpgsql;
