-- Private cross-device state for anonymous and authenticated Supabase users.
create table if not exists public.chef_app_state (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.chef_app_state enable row level security;

drop policy if exists "Users can read their own app state" on public.chef_app_state;
create policy "Users can read their own app state"
  on public.chef_app_state for select to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists "Users can create their own app state" on public.chef_app_state;
create policy "Users can create their own app state"
  on public.chef_app_state for insert to authenticated
  with check (auth.uid() = auth_user_id);

drop policy if exists "Users can update their own app state" on public.chef_app_state;
create policy "Users can update their own app state"
  on public.chef_app_state for update to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

drop policy if exists "Users can delete their own app state" on public.chef_app_state;
create policy "Users can delete their own app state"
  on public.chef_app_state for delete to authenticated
  using (auth.uid() = auth_user_id);

drop trigger if exists on_chef_app_state_updated on public.chef_app_state;
create trigger on_chef_app_state_updated
  before update on public.chef_app_state
  for each row execute function public.handle_updated_at();
