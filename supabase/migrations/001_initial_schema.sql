-- Extensions
create extension if not exists pgcrypto;

-- Users
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'viewer' check (role in ('viewer', 'author', 'admin')),
  created_at timestamptz not null default now()
);

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  author_id uuid not null references public.users(id) on delete cascade,
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  comment_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_author_id on public.posts(author_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_comments_post_id_created_at on public.comments(post_id, created_at desc);

-- Enable RLS
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Utility function to read role by auth.uid()
create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.users where id = auth.uid();
$$;

-- USERS policies
create policy "users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "admins can view all users"
  on public.users for select
  using (public.current_role() = 'admin');

create policy "users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- POSTS policies
create policy "public can read posts"
  on public.posts for select
  using (true);

create policy "author admin can insert posts"
  on public.posts for insert
  with check (
    auth.uid() = author_id
    and public.current_role() in ('author', 'admin')
  );

create policy "author owner can update own post"
  on public.posts for update
  using (auth.uid() = author_id and public.current_role() = 'author')
  with check (auth.uid() = author_id and public.current_role() = 'author');

create policy "admin can update any post"
  on public.posts for update
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- COMMENTS policies
create policy "public can read comments"
  on public.comments for select
  using (true);

create policy "authenticated users can insert comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "admin can monitor comments"
  on public.comments for delete
  using (public.current_role() = 'admin');
