-- Anonymous chef profiles and the public XP leaderboard.
create table if not exists public.chefs (
  chef_id text primary key,
  chef_name text not null,
  country text,
  avatar_seed text,
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard (
  chef_id text primary key references public.chefs(chef_id) on delete cascade,
  total_xp integer not null default 0 check (total_xp >= 0),
  weekly_xp integer not null default 0 check (weekly_xp >= 0),
  level integer not null default 1 check (level >= 1),
  achievements_count integer not null default 0 check (achievements_count >= 0),
  last_active_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leaderboard_weekly_xp on public.leaderboard(weekly_xp desc);
create index if not exists idx_leaderboard_total_xp on public.leaderboard(total_xp desc);

alter table public.chefs enable row level security;
alter table public.leaderboard enable row level security;

drop policy if exists "Public read chefs" on public.chefs;
create policy "Public read chefs" on public.chefs for select using (true);
drop policy if exists "Public upsert chefs" on public.chefs;
create policy "Public upsert chefs" on public.chefs for insert with check (true);
drop policy if exists "Public update chefs" on public.chefs;
create policy "Public update chefs" on public.chefs for update using (true) with check (true);

drop policy if exists "Public read leaderboard" on public.leaderboard;
create policy "Public read leaderboard" on public.leaderboard for select using (true);
drop policy if exists "Public upsert leaderboard" on public.leaderboard;
create policy "Public upsert leaderboard" on public.leaderboard for insert with check (true);
drop policy if exists "Public update leaderboard" on public.leaderboard;
create policy "Public update leaderboard" on public.leaderboard for update using (true) with check (true);

create or replace function public.upsert_chef_stats(
  p_chef_id text,
  p_chef_name text,
  p_total_xp integer,
  p_weekly_xp integer,
  p_level integer,
  p_achievements_count integer,
  p_avatar_seed text default null,
  p_country text default null
)
returns void
language plpgsql
as $$
begin
  insert into public.chefs (chef_id, chef_name, avatar_seed, country, updated_at)
  values (p_chef_id, p_chef_name, p_avatar_seed, p_country, now())
  on conflict (chef_id) do update set
    chef_name = excluded.chef_name,
    avatar_seed = coalesce(excluded.avatar_seed, chefs.avatar_seed),
    country = coalesce(excluded.country, chefs.country),
    updated_at = now();

  insert into public.leaderboard (
    chef_id, total_xp, weekly_xp, level, achievements_count, last_active_at, updated_at
  )
  values (
    p_chef_id, p_total_xp, p_weekly_xp, p_level, p_achievements_count, now(), now()
  )
  on conflict (chef_id) do update set
    total_xp = greatest(leaderboard.total_xp, excluded.total_xp),
    weekly_xp = excluded.weekly_xp,
    level = greatest(leaderboard.level, excluded.level),
    achievements_count = greatest(leaderboard.achievements_count, excluded.achievements_count),
    last_active_at = now(),
    updated_at = now();
end;
$$;

-- Add leaderboard once when the Supabase Realtime publication is available.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'leaderboard'
     ) then
    alter publication supabase_realtime add table public.leaderboard;
  end if;
end;
$$;
