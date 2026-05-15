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

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (email = lower(email))
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.user_profiles;
create policy "Users can view their own profile"
on public.user_profiles
for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own profile" on public.user_profiles;
create policy "Users can insert their own profile"
on public.user_profiles
for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
on public.user_profiles
for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own profile" on public.user_profiles;
create policy "Users can delete their own profile"
on public.user_profiles
for delete
using ((select auth.uid()) = user_id);

create table if not exists public.friend_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  invitee_email text not null,
  invitee_id uuid references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz,
  unique (requester_id, invitee_email),
  check (invitee_email = lower(invitee_email))
);

create index if not exists friend_connections_requester_idx on public.friend_connections (requester_id, status);
create index if not exists friend_connections_invitee_idx on public.friend_connections (invitee_id, status);
create index if not exists friend_connections_invitee_email_idx on public.friend_connections (invitee_email, status);

alter table public.friend_connections enable row level security;

drop policy if exists "Users can view their own friend connections" on public.friend_connections;
create policy "Users can view their own friend connections"
on public.friend_connections
for select
using (
  (select auth.uid()) = requester_id
  or (select auth.uid()) = invitee_id
  or lower(coalesce((select auth.jwt() ->> 'email'), '')) = lower(invitee_email)
);

drop policy if exists "Users can create friend invites" on public.friend_connections;
create policy "Users can create friend invites"
on public.friend_connections
for insert
with check (
  (select auth.uid()) = requester_id
  and invitee_email = lower(invitee_email)
);

drop policy if exists "Users can update their friend connections" on public.friend_connections;
create policy "Users can update their friend connections"
on public.friend_connections
for update
using (
  (select auth.uid()) = requester_id
  or (select auth.uid()) = invitee_id
  or lower(coalesce((select auth.jwt() ->> 'email'), '')) = lower(invitee_email)
)
with check (
  (
    (select auth.uid()) = requester_id
    or (select auth.uid()) = invitee_id
    or lower(coalesce((select auth.jwt() ->> 'email'), '')) = lower(invitee_email)
  )
  and invitee_email = lower(invitee_email)
);

drop policy if exists "Users can delete their friend connections" on public.friend_connections;
create policy "Users can delete their friend connections"
on public.friend_connections
for delete
using (
  (select auth.uid()) = requester_id
  or (select auth.uid()) = invitee_id
  or lower(coalesce((select auth.jwt() ->> 'email'), '')) = lower(invitee_email)
);

drop policy if exists "Friends can view accepted boards" on public.user_boards;
create policy "Friends can view accepted boards"
on public.user_boards
for select
using (
  exists (
    select 1
    from public.friend_connections
    where friend_connections.status = 'accepted'
      and (
        (friend_connections.requester_id = (select auth.uid()) and friend_connections.invitee_id = public.user_boards.user_id)
        or
        (friend_connections.invitee_id = (select auth.uid()) and friend_connections.requester_id = public.user_boards.user_id)
      )
  )
);

drop policy if exists "Friends can view connected profiles" on public.user_profiles;
create policy "Friends can view connected profiles"
on public.user_profiles
for select
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.friend_connections
    where friend_connections.status in ('pending', 'accepted')
      and (
        (friend_connections.requester_id = (select auth.uid()) and friend_connections.invitee_id = public.user_profiles.user_id)
        or
        (friend_connections.invitee_id = (select auth.uid()) and friend_connections.requester_id = public.user_profiles.user_id)
      )
  )
);

create table if not exists public.shared_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (char_length(trim(body)) between 1 and 280)
);

create index if not exists shared_notes_author_idx on public.shared_notes (author_id, created_at desc);

alter table public.shared_notes enable row level security;

drop policy if exists "Users can view friend notes" on public.shared_notes;
create policy "Users can view friend notes"
on public.shared_notes
for select
using (
  (select auth.uid()) = author_id
  or exists (
    select 1
    from public.friend_connections
    where friend_connections.status = 'accepted'
      and (
        (friend_connections.requester_id = (select auth.uid()) and friend_connections.invitee_id = public.shared_notes.author_id)
        or
        (friend_connections.invitee_id = (select auth.uid()) and friend_connections.requester_id = public.shared_notes.author_id)
      )
  )
);

drop policy if exists "Users can create their own notes" on public.shared_notes;
create policy "Users can create their own notes"
on public.shared_notes
for insert
with check ((select auth.uid()) = author_id);

drop policy if exists "Users can update their own notes" on public.shared_notes;
create policy "Users can update their own notes"
on public.shared_notes
for update
using ((select auth.uid()) = author_id)
with check ((select auth.uid()) = author_id);

drop policy if exists "Users can delete their own notes" on public.shared_notes;
create policy "Users can delete their own notes"
on public.shared_notes
for delete
using ((select auth.uid()) = author_id);
