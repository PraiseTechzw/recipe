-- Keep community content readable while tying every client write to its
-- authenticated Supabase user. Public/anonymous writes are never permitted.

-- Hosted projects may already have a legacy profiles table and may not have
-- applied the core schema migration in this repository. Ensure the column
-- exists before creating owner-only policies or the auth-link trigger.
alter table public.profiles
  add column if not exists auth_user_id uuid unique
  references auth.users(id) on delete set null;

-- Remove legacy or manually-created permissive policies first, since
-- PostgreSQL combines permissive policies with OR semantics.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'recipes', 'chefs', 'leaderboard')
  loop
    execute format('drop policy %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;

  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
      and (
        policyname ilike '%recipe%'
        or policyname ilike '%avatar%'
        or coalesce(qual, '') ilike '%recipes%'
        or coalesce(qual, '') ilike '%avatars%'
        or coalesce(with_check, '') ilike '%recipes%'
        or coalesce(with_check, '') ilike '%avatars%'
      )
  loop
    execute format('drop policy %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end;
$$;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select using (true);
-- Public recipe cards only need these display fields. Keep account identity,
-- dietary preferences, XP, badges, and stats out of public client reads.
revoke select on table public.profiles from public, anon, authenticated;
grant select (id, name, avatar_url, bio) on table public.profiles to anon, authenticated;
create policy "Recipes are viewable by everyone."
  on public.recipes for select using (true);
create policy "Public read chefs"
  on public.chefs for select using (true);
create policy "Public read leaderboard"
  on public.leaderboard for select using (true);

drop policy if exists "Public profiles are editable by everyone." on public.profiles;
drop policy if exists "Profiles are editable by owner." on public.profiles;
create policy "Profiles are editable by owner"
  on public.profiles for all to authenticated
  using (id = auth.uid()::text and auth_user_id = auth.uid())
  with check (id = auth.uid()::text and auth_user_id = auth.uid());

drop policy if exists "Recipes are editable by everyone." on public.recipes;
drop policy if exists "Recipes are writable by author." on public.recipes;
drop policy if exists "Recipes are editable by author" on public.recipes;
drop policy if exists "Recipes are deletable by author" on public.recipes;
create policy "Recipes are writable by author"
  on public.recipes for insert to authenticated
  with check (author_id = auth.uid()::text);
create policy "Recipes are editable by author"
  on public.recipes for update to authenticated
  using (author_id = auth.uid()::text)
  with check (author_id = auth.uid()::text);
create policy "Recipes are deletable by author"
  on public.recipes for delete to authenticated
  using (author_id = auth.uid()::text);

-- The client can read rankings, but only trusted server/admin tooling can
-- write scores. Do not expose the old security-definer writer to app roles.
drop policy if exists "Public upsert chefs" on public.chefs;
drop policy if exists "Public update chefs" on public.chefs;
drop policy if exists "Public upsert leaderboard" on public.leaderboard;
drop policy if exists "Public update leaderboard" on public.leaderboard;
revoke execute on function public.upsert_chef_stats(text, text, integer, integer, integer, integer, text, text)
  from public, anon, authenticated;

drop policy if exists "Anyone can upload recipe images." on storage.objects;
drop policy if exists "Anyone can update recipe images." on storage.objects;
drop policy if exists "Anyone can delete recipe images." on storage.objects;
drop policy if exists "Authenticated users upload recipe images to their folder" on storage.objects;
drop policy if exists "Authenticated users update recipe images in their folder" on storage.objects;
drop policy if exists "Authenticated users delete recipe images in their folder" on storage.objects;
create policy "Authenticated users upload recipe images to their folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'recipes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Authenticated users update recipe images in their folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'recipes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'recipes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Authenticated users delete recipe images in their folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'recipes' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Anyone can upload avatars." on storage.objects;
drop policy if exists "Anyone can update avatars." on storage.objects;
drop policy if exists "Anyone can delete avatars." on storage.objects;
drop policy if exists "Authenticated users upload avatars to their folder" on storage.objects;
drop policy if exists "Authenticated users update avatars in their folder" on storage.objects;
drop policy if exists "Authenticated users delete avatars in their folder" on storage.objects;
create policy "Authenticated users upload avatars to their folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Authenticated users update avatars in their folder"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Authenticated users delete avatars in their folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- A user's own row is identified by the Auth UUID. This also keeps clients
-- from attaching an existing public profile to another account.
create or replace function public.guard_profile_auth_link()
returns trigger
language plpgsql
as $$
begin
  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    if new.id <> auth.uid()::text or new.auth_user_id <> auth.uid() then
      raise exception 'A profile can only be written by its authenticated owner';
    end if;
    if tg_op = 'UPDATE' and old.auth_user_id is distinct from new.auth_user_id then
      raise exception 'A profile auth link cannot be changed by a client';
    end if;
  end if;
  return new;
end;
$$;

-- Enforce a per-account ceiling on AI usage. The Edge Function calls this
-- atomic RPC before forwarding requests to the paid provider account.
create table if not exists public.ai_request_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0)
);
alter table public.ai_request_limits enable row level security;
revoke all on table public.ai_request_limits from public, anon, authenticated;

create or replace function public.consume_ai_request_limit()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  current_window timestamptz := date_trunc('hour', now());
  updated_count integer;
begin
  if caller_id is null then
    return false;
  end if;
  insert into public.ai_request_limits (user_id, window_started_at, request_count)
  values (caller_id, current_window, 1)
  on conflict (user_id) do update set
    request_count = case
      when public.ai_request_limits.window_started_at < current_window then 1
      else public.ai_request_limits.request_count + 1
    end,
    window_started_at = case
      when public.ai_request_limits.window_started_at < current_window then current_window
      else public.ai_request_limits.window_started_at
    end
  returning request_count into updated_count;
  return updated_count <= 30;
end;
$$;
revoke execute on function public.consume_ai_request_limit() from public, anon;
grant execute on function public.consume_ai_request_limit() to authenticated;

