-- Seed data for Aetherfield Blogging Platform
--
-- IMPORTANT:
-- 1. Make sure at least one user exists in public.users.
-- 2. Run this file inside the Supabase SQL editor.
--
-- This script is idempotent:
-- - It inserts posts only when a post with the same title does not already exist.
-- - It inserts comments only when the same comment text does not already exist for that post.

do $$
begin
  if not exists (select 1 from public.users) then
    raise exception 'No rows found in public.users. Please sign up at least one user first, then run seed.sql again.';
  end if;
end
$$;

with selected_author as (
  select coalesce(
    (select id from public.users where role in ('author', 'admin') order by created_at asc limit 1),
    (select id from public.users order by created_at asc limit 1)
  ) as id
),
seed_posts as (
  select *
  from (
    values
      (
        'How AI summaries improve blog browsing',
        'AI-generated summaries help readers scan content quickly and decide what to open. In this platform, the summary is generated once at creation time, stored in the database, and reused on listing pages to reduce repeated API calls. That keeps the experience fast while also controlling AI costs. Authors can still edit the original post content while the stored summary remains available for previews.',
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
        'This post explains why generating a summary once and storing it in the database gives readers faster previews, lowers repeated API usage, and keeps the blog scalable.',
        72
      ),
      (
        'Role-based access for blog publishing',
        'A role-based system keeps blog publishing simple and secure. Viewers can read and comment, authors can create and edit their own posts, and admins can manage everything. This separation of access protects the content while still allowing collaboration. In production, Supabase row-level security can enforce these permissions at the database layer.',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        'This post breaks down how viewer, author, and admin roles map to clear permissions and why the database should enforce the rules.',
        48
      ),
      (
        'Why sustainable architecture matters in modern cities',
        'Sustainable architecture focuses on reducing environmental impact while keeping buildings efficient and healthy for people. Better insulation, passive cooling, renewable energy integration, and water reuse all contribute to long-term savings and reduced carbon emissions. Good design combines material choices and local climate strategy rather than using one template everywhere.',
        'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=80',
        'An overview of practical sustainable architecture patterns that lower environmental impact and operational costs over time.',
        36
      ),
      (
        'Practical guide to writing clear technical blog posts',
        'Clear technical writing starts with structure. Open with the problem, explain the context, provide a working solution, and close with trade-offs or next steps. Short sections, specific examples, and realistic code snippets make content easier to follow. Writers should optimize for reader decisions, not just for word count.',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
        'A practical framework for producing technical posts that are easy to scan, understand, and apply.',
        24
      ),
      (
        'Building reliable APIs with validation and guardrails',
        'Reliable APIs combine strict input validation, clear error responses, and role-based authorization. Validation prevents malformed data from entering the system, while consistent error shapes help clients handle failures predictably. Guardrails such as pagination limits and authorization checks reduce abuse and accidental outages.',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        'How to design APIs with defensive checks so they remain stable, secure, and easy to consume.',
        12
      ),
      (
        'Keeping frontend performance fast with cached summaries',
        'Frontend listing pages often become slow when they recompute expensive content repeatedly. By persisting post summaries at write time and reusing them in list views, the UI stays responsive and backend AI usage stays predictable. This approach is especially effective when traffic spikes and users rely on quick previews.',
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
        'Storing summaries once and reusing them can significantly improve perceived speed on post listing pages.',
        6
      )
  ) as p(title, body, image_url, summary, created_hours_ago)
)
insert into public.posts (title, body, image_url, author_id, summary, created_at, updated_at)
select
  p.title,
  p.body,
  p.image_url,
  a.id,
  p.summary,
  now() - make_interval(hours => p.created_hours_ago),
  now() - make_interval(hours => p.created_hours_ago)
from seed_posts p
cross join selected_author a
where not exists (
  select 1 from public.posts existing where existing.title = p.title
);

with selected_commenter as (
  select coalesce(
    (select id from public.users where role = 'viewer' order by created_at asc limit 1),
    (select id from public.users order by created_at asc limit 1)
  ) as id
),
seed_comments as (
  select *
  from (
    values
      (
        'How AI summaries improve blog browsing',
        'This summary-first approach is very practical for list pages and helps me pick what to read quickly.',
        10
      ),
      (
        'Role-based access for blog publishing',
        'The role separation is simple and clear. This is exactly what small teams need.',
        8
      ),
      (
        'Building reliable APIs with validation and guardrails',
        'Great reminder that consistent error shapes make API clients much easier to maintain.',
        4
      )
  ) as c(post_title, comment_text, created_hours_ago)
)
insert into public.comments (post_id, user_id, comment_text, created_at)
select
  p.id,
  commenter.id,
  c.comment_text,
  now() - make_interval(hours => c.created_hours_ago)
from seed_comments c
join public.posts p on p.title = c.post_title
cross join selected_commenter commenter
where not exists (
  select 1
  from public.comments existing
  where existing.post_id = p.id
    and existing.comment_text = c.comment_text
);
