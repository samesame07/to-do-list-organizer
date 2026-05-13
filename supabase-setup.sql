create table if not exists public.user_boards (
  user_id uuid primary key references auth.users (id) on delete cascade,
  board_state jsonb not null default '{}'::jsonb,
  preserved_boards jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_boards enable row level security;

drop policy if exists "Users can view their own board" on public.user_boards;
create policy "Users can view their own board"
on public.user_boards
for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own board" on public.user_boards;
create policy "Users can insert their own board"
on public.user_boards
for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own board" on public.user_boards;
create policy "Users can update their own board"
on public.user_boards
for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own board" on public.user_boards;
create policy "Users can delete their own board"
on public.user_boards
for delete
using ((select auth.uid()) = user_id);
