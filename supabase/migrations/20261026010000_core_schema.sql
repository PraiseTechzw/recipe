-- Core application tables, public recipe images, and update timestamps.
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id text primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text,
  avatar_url text,
  bio text,
  xp integer not null default 0,
  chef_level text not null default 'Beginner',
  badges jsonb not null default '[]'::jsonb,
  stats jsonb not null default '{"recipesCooked": 0, "savedRecipes": 0, "sharedRecipes": 0, "daysStreak": 0}'::jsonb,
  dietary_preferences jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Link existing public chef profiles to Supabase Auth without making email
-- addresses part of the public profile record.
alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_id text references public.profiles(id),
  original_id text,
  device_id text,
  title text not null,
  description text,
  image_url text,
  category text,
  tags jsonb not null default '[]'::jsonb,
  time text,
  servings integer,
  calories text,
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  is_traditional boolean not null default false,
  rating numeric not null default 0,
  reviews_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Older hand-created schemas predate the sync queue's device_id column.
alter table public.recipes add column if not exists device_id text;

create index if not exists recipes_author_id_idx on public.recipes(author_id);
create index if not exists recipes_original_id_idx on public.recipes(original_id);
create index if not exists recipes_device_id_idx on public.recipes(device_id);

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;

-- The current app uses anonymous device profiles, so these policies preserve
-- the existing client workflow. Add Supabase Auth before exposing private data.
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select using (true);
drop policy if exists "Public profiles are editable by everyone." on public.profiles;
create policy "Public profiles are editable by everyone."
  on public.profiles for all using (true) with check (true);

drop policy if exists "Recipes are viewable by everyone." on public.recipes;
create policy "Recipes are viewable by everyone."
  on public.recipes for select using (true);
drop policy if exists "Recipes are editable by everyone." on public.recipes;
create policy "Recipes are editable by everyone."
  on public.recipes for all using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('recipes', 'recipes', true), ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Recipe images are publicly accessible." on storage.objects;
create policy "Recipe images are publicly accessible."
  on storage.objects for select using (bucket_id = 'recipes');
drop policy if exists "Anyone can upload recipe images." on storage.objects;
create policy "Anyone can upload recipe images."
  on storage.objects for insert with check (bucket_id = 'recipes');
drop policy if exists "Anyone can update recipe images." on storage.objects;
create policy "Anyone can update recipe images."
  on storage.objects for update using (bucket_id = 'recipes') with check (bucket_id = 'recipes');

drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "Anyone can upload avatars." on storage.objects;
create policy "Anyone can upload avatars."
  on storage.objects for insert with check (bucket_id = 'avatars');
drop policy if exists "Anyone can update avatars." on storage.objects;
create policy "Anyone can update avatars."
  on storage.objects for update using (bucket_id = 'avatars') with check (bucket_id = 'avatars');

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.guard_profile_auth_link()
returns trigger
language plpgsql
as $$
begin
  if (
       (tg_op = 'INSERT' and new.auth_user_id is not null)
       or (tg_op = 'UPDATE' and new.auth_user_id is distinct from old.auth_user_id)
     )
     and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    raise exception 'Only a Supabase administrator can change a profile auth link';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();
drop trigger if exists profiles_auth_link_admin_only on public.profiles;
create trigger profiles_auth_link_admin_only
  before insert or update on public.profiles
  for each row execute function public.guard_profile_auth_link();
drop trigger if exists on_recipes_updated on public.recipes;
create trigger on_recipes_updated
  before update on public.recipes
  for each row execute function public.handle_updated_at();
