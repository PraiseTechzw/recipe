-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
-- Stores user data extended from auth.users
create table public.profiles (
  id uuid references auth.users not null primary key,
  name text,
  avatar_url text,
  bio text,
  xp integer default 0,
  chef_level text default 'Beginner',
  badges jsonb default '[]'::jsonb,
  stats jsonb default '{"recipesCooked": 0, "savedRecipes": 0, "sharedRecipes": 0, "daysStreak": 0}'::jsonb,
  dietary_preferences jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. RECIPES TABLE
-- Stores recipes created by users
create table public.recipes (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) not null,
  original_id text, -- ID from local device state
  title text not null,
  description text,
  image_url text,
  category text,
  tags jsonb default '[]'::jsonb,
  time text,
  servings integer,
  calories text,
  ingredients jsonb default '[]'::jsonb, -- Stores array of IngredientSection
  steps jsonb default '[]'::jsonb,       -- Stores array of Step
  is_traditional boolean default false,
  rating numeric default 0,
  reviews_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Recipes
alter table public.recipes enable row level security;

create policy "Recipes are viewable by everyone."
  on recipes for select
  using ( true );

create policy "Authenticated users can insert recipes."
  on recipes for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update own recipes."
  on recipes for update
  using ( auth.uid() = author_id );

create policy "Users can delete own recipes."
  on recipes for delete
  using ( auth.uid() = author_id );

-- 3. STORAGE SETUP
-- Create a storage bucket for 'recipes' and 'avatars'
insert into storage.buckets (id, name, public)
values ('recipes', 'recipes', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies
-- Recipes Bucket
create policy "Recipe images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'recipes' );

create policy "Authenticated users can upload recipe images."
  on storage.objects for insert
  with check ( bucket_id = 'recipes' and auth.role() = 'authenticated' );

create policy "Users can update their own recipe images."
  on storage.objects for update
  using ( bucket_id = 'recipes' and auth.uid() = owner );

create policy "Users can delete their own recipe images."
  on storage.objects for delete
  using ( bucket_id = 'recipes' and auth.uid() = owner );

-- Avatars Bucket
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- 4. TRIGGERS
-- Handle new user signup -> auto-create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Handle updated_at timestamps
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure handle_updated_at();

create trigger on_recipes_updated
  before update on public.recipes
  for each row execute procedure handle_updated_at();
