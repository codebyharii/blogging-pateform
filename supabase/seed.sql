-- Seed data for Aetherfield Blogging Platform
--
-- IMPORTANT:
-- 1. Create the auth users first by signing up in the app or by using Supabase Auth.
-- 2. Replace the placeholder UUIDs below with real auth.users.id values.
-- 3. Run this file inside the Supabase SQL editor.

-- Replace these with real auth user IDs from Supabase Auth
-- Example: select id, email from auth.users;

-- Demo users
insert into public.users (id, name, email, role)
values
  ('11111111-1111-1111-1111-111111111111', 'Asha Writer', 'asha.writer@example.com', 'author'),
  ('22222222-2222-2222-2222-222222222222', 'Ravi Reader', 'ravi.reader@example.com', 'viewer'),
  ('33333333-3333-3333-3333-333333333333', 'Nina Admin', 'nina.admin@example.com', 'admin')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role;

-- Demo posts
insert into public.posts (id, title, body, image_url, author_id, summary, created_at, updated_at)
values
  (
    gen_random_uuid(),
    'How AI summaries improve blog browsing',
    'AI-generated summaries help readers scan content quickly and decide what to open. In this platform, the summary is generated once at creation time, stored in the database, and reused on listing pages to reduce repeated API calls. That keeps the experience fast while also controlling AI costs. Authors can still edit the original post content while the stored summary remains available for previews.',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    '11111111-1111-1111-1111-111111111111',
    'This post explains why generating a summary once and storing it in the database gives readers faster previews, lowers repeated API usage, and keeps the blog scalable.',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    gen_random_uuid(),
    'Role-based access for blog publishing',
    'A role-based system keeps blog publishing simple and secure. Viewers can read and comment, authors can create and edit their own posts, and admins can manage everything. This separation of access protects the content while still allowing collaboration. In production, Supabase row-level security can enforce these permissions at the database layer.',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    '11111111-1111-1111-1111-111111111111',
    'This post breaks down how viewer, author, and admin roles map to clear permissions and why the database should enforce the rules.',
    now() - interval '1 day',
    now() - interval '1 day'
  )
on conflict do nothing;

-- Demo comments
insert into public.comments (id, post_id, user_id, comment_text, created_at)
select
  gen_random_uuid(),
  p.id,
  '22222222-2222-2222-2222-222222222222',
  'This is a good example of how the summary helps me decide what to read first.',
  now() - interval '12 hours'
from public.posts p
where p.title = 'How AI summaries improve blog browsing'
on conflict do nothing;

insert into public.comments (id, post_id, user_id, comment_text, created_at)
select
  gen_random_uuid(),
  p.id,
  '33333333-3333-3333-3333-333333333333',
  'The role-based permissions look clear and practical for a small blogging platform.',
  now() - interval '6 hours'
from public.posts p
where p.title = 'Role-based access for blog publishing'
on conflict do nothing;
