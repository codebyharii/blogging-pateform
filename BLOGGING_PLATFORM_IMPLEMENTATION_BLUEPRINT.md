
# Blogging Platform with Next.js + Supabase

## 1. Objective
Build a basic blogging platform using Next.js and Supabase, with AI-assisted development and Google AI summary generation.

This document is a full implementation blueprint (no code yet). It includes architecture, role-based permissions, database schema, API routes, AI flow, deployment plan, repository requirements, and UI design standards based on the provided Aetherfield Design System v2.0.

---

## 2. Mandatory AI Tool Usage (Submission Requirement)
You must use an AI-assisted coding tool during development.

Approved examples:
- Cursor
- Windsurf
- Antigravity
- Qoder
- Any similar AI coding assistant

In the final submission, explain:
1. Which tool was used
2. Why it was selected
3. How it accelerated or improved development

Recommended evidence to keep during development:
- Small log of prompts used for implementation
- Notes on generated/refactored sections
- Notes on where manual fixes were needed after AI output

---

## 3. Required Tech Stack
- Frontend + Backend: Next.js
- Authentication: Supabase Auth
- Database: Supabase Postgres
- Version Control: Git + GitHub
- Deployment: Vercel or Netlify (or similar)
- AI Integration: Free Google AI API for summary generation

---

## 4. High-Level Architecture

### 4.1 System Components
1. Next.js App Router frontend for pages and UI
2. Next.js server-side API routes for secured operations
3. Supabase Auth for sign-in/sign-up/session
4. Supabase Postgres for users, posts, comments
5. Google AI API call during post creation to generate ~200-word summary

### 4.2 Data and Request Flow
1. User authenticates with Supabase Auth
2. Role is resolved from users table (viewer, author, admin)
3. Author/Admin creates post
4. Server route calls Google AI API once for summary generation
5. Post with summary is persisted in posts table
6. Viewer/Author/Admin browse posts with search + pagination
7. Users comment on post via protected route

### 4.3 Security Strategy
- Never call privileged DB operations from client directly
- Validate user role in server routes before write/edit operations
- Use row-level security policies in Supabase to protect data
- Keep AI API key only on server via environment variables

---

## 5. User Roles and Permissions

### 5.1 Viewer
- View blog posts
- View generated summaries
- Comment on posts
- Cannot create or edit posts

### 5.2 Author
- Create posts
- Edit own posts only
- View comments on own posts
- View post listings and summaries
- Comment on posts

### 5.3 Admin
- View all posts
- Edit any post
- Monitor all comments
- Optional moderation actions (recommended): delete/flag comments

### 5.4 Permission Matrix
| Action | Viewer | Author | Admin |
|---|---|---|---|
| Read post list/details | Yes | Yes | Yes |
| Read summary in listings | Yes | Yes | Yes |
| Create post | No | Yes | Yes |
| Edit own post | No | Yes | Yes |
| Edit any post | No | No | Yes |
| Add comment | Yes | Yes | Yes |
| Monitor all comments | No | Own post comments | Yes |

---

## 6. Database Design (Supabase)

## 6.1 Required Tables

### users
- id (uuid, primary key, references auth.users.id)
- name (text, not null)
- email (text, unique, not null)
- role (text, not null, allowed values: viewer, author, admin)
- created_at (timestamp, default now)

### posts
- id (uuid, primary key)
- title (text, not null)
- body (text, not null)
- image_url (text, nullable)
- author_id (uuid, not null, fk users.id)
- summary (text, not null)
- created_at (timestamp, default now)
- updated_at (timestamp, default now)

### comments
- id (uuid, primary key)
- post_id (uuid, not null, fk posts.id)
- user_id (uuid, not null, fk users.id)
- comment_text (text, not null)
- created_at (timestamp, default now)

## 6.2 Relationships
- One user can author many posts
- One post can have many comments
- One user can create many comments

## 6.3 Index Recommendations
- posts(author_id)
- posts(created_at desc)
- posts(title text pattern ops) or full text index
- comments(post_id, created_at desc)

## 6.4 Row Level Security Policy Plan
- users: users can read own profile; admin can read all; server role can manage
- posts:
  - public read for listings/details
  - insert only by author/admin
  - update by post owner or admin
- comments:
  - insert by authenticated users
  - read public or authenticated (as per product decision)
  - delete/update by admin (optional)

---

## 7. API Route Blueprint (Next.js)
All write operations should go through server-side routes.

Base prefix: /api

### 7.1 Auth and Profile
1. POST /api/auth/sync-user
- Purpose: create/update users table row after auth event
- Access: authenticated
- Input: name, email
- Output: user profile with role

2. GET /api/auth/me
- Purpose: current user profile + role
- Access: authenticated
- Output: id, name, email, role

### 7.2 Posts
3. GET /api/posts
- Purpose: list posts with search + pagination + summary
- Access: public
- Query params:
  - page (default 1)
  - limit (default 10)
  - search (optional, title/body)
  - authorId (optional)
- Response:
  - items: [{id, title, image_url, author_id, summary, created_at}]
  - pagination: {page, limit, total, totalPages}

4. GET /api/posts/:id
- Purpose: get post detail with comments
- Access: public
- Response:
  - post detail + author info + comments list

5. POST /api/posts
- Purpose: create post and generate summary once
- Access: author/admin
- Input:
  - title
  - body
  - image_url
- Server steps:
  1. validate session and role
  2. call Google AI API to generate around 200-word summary
  3. store title/body/image_url/author_id/summary
- Output: created post object

6. PATCH /api/posts/:id
- Purpose: edit post
- Access:
  - author if owner
  - admin for any post
- Input: title/body/image_url
- Summary behavior:
  - default: do not regenerate automatically on edit (cost optimization)
  - optional endpoint for manual regenerate

7. POST /api/posts/:id/regenerate-summary (optional, recommended)
- Purpose: regenerate summary on demand
- Access: owner author/admin
- Input: none
- Output: updated summary

### 7.3 Comments
8. GET /api/posts/:id/comments
- Purpose: list comments for a post
- Access: public

9. POST /api/posts/:id/comments
- Purpose: add comment to post
- Access: authenticated (viewer/author/admin)
- Input: comment_text

10. GET /api/comments/moderation
- Purpose: monitor comments across posts
- Access: admin
- Query params: page, limit, search

### 7.4 Admin
11. GET /api/admin/posts
- Purpose: view all posts with filters
- Access: admin

12. PATCH /api/admin/posts/:id
- Purpose: edit any post
- Access: admin

---

## 8. Frontend Route and Page Blueprint (Next.js App Router)

1. / (home)
- Featured and latest posts
- Search bar
- Pagination controls
- Summary snippet visible for each card

2. /auth/login
- Login/signup interface (Supabase Auth)

3. /dashboard
- Role-aware dashboard
- Quick actions based on viewer/author/admin

4. /posts
- Post listing page with search + pagination

5. /posts/:id
- Post detail page
- Body + image + comments section
- Comment create form for authenticated users

6. /posts/new
- Create post (author/admin only)
- On submit triggers server summary generation

7. /posts/:id/edit
- Edit post (owner author/admin)

8. /admin/comments
- Global comments monitoring (admin only)

9. /admin/posts
- Global post management (admin only)

---

## 9. AI Summary Generation Design

## 9.1 Functional Requirement
When a new post is created:
1. Generate approximately 200-word summary using Google AI API
2. Persist summary in posts.summary
3. Show summary on listing cards

## 9.2 Prompt Strategy (Conceptual)
- Input: post title + post body
- Instruction goals:
  - concise and factual
  - avoid hallucination
  - around 180-220 words
  - neutral tone suitable for blog preview

## 9.3 Cost Optimization Rules
1. Generate summary only on initial create
2. Store summary in DB and reuse for all future reads
3. Avoid re-calling AI API in listing/detail fetch routes
4. Regenerate only through explicit action endpoint
5. Add basic content-length guard to avoid overlong token input

## 9.4 Reliability and Failure Handling
- If AI API fails:
  - fail-fast with clear error, or
  - store fallback truncated manual summary and log warning
- Keep server logs with request id for debugging

---

## 10. Search and Pagination Plan

### 10.1 Search
- Search scope: title and body
- Query param: search
- Debounced client input recommended

### 10.2 Pagination
- Query params: page, limit
- Return total and totalPages
- UI controls: previous/next plus page indicator

### 10.3 Sorting
- Default: newest first (created_at desc)

---

## 11. Validation and Error Handling Plan

### 11.1 Input Validation
- Title required, min length
- Body required, min length
- Image URL optional but validated if provided
- Comment text required and sanitized

### 11.2 Authorization Errors
- 401 for unauthenticated
- 403 for authenticated but insufficient role

### 11.3 Common API Error Response Shape
- success: false
- message: human-readable reason
- code: stable machine code

---

## 12. Environment Variables Plan
Server-only secrets must never be exposed in client bundle.

Required variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)
- GOOGLE_AI_API_KEY (server only)
- NEXT_PUBLIC_APP_URL

Optional:
- GOOGLE_AI_MODEL
- SUMMARY_WORD_TARGET

---

## 13. Deployment Plan (Vercel/Netlify)

### 13.1 Mandatory Outcomes
1. Application deployed publicly
2. URL accessible without authentication barriers (for public pages)
3. Environment variables configured correctly in hosting dashboard

### 13.2 Deployment Steps
1. Push project to GitHub
2. Import repository into Vercel/Netlify
3. Configure env vars
4. Build and deploy
5. Verify auth, post creation, summary generation, comment flow, and role guards

### 13.3 Post-Deploy Verification Checklist
- Public listing page works
- Search and pagination work
- Login and role mapping work
- Author can create/edit own post
- Viewer cannot create/edit posts
- Admin can edit all and monitor comments
- Summary appears on listing for newly created posts

---

## 14. Git and Repository Structure Plan

### 14.1 Branching Recommendation
- main: stable deploy branch
- feature/*: role, posts, comments, ai-summary, ui

### 14.2 Commit Guidelines
- Small and feature-focused commits
- Clear commit titles for each requirement block

### 14.3 README Must Include
1. Project overview
2. Tech stack
3. Local setup instructions
4. Environment variables
5. Database setup steps
6. How AI summary flow works
7. Deployment steps
8. Role-based access explanation
9. Known limitations

---

## 15. Submission Checklist Mapping

You must submit:
1. GitHub repository link
2. Live deployed URL
3. Short write-up covering:
   - AI tools: tool used, why, how it helped
   - Feature logic: auth flow, role access, post creation, AI summary flow
   - Cost optimization: summary once, store and reuse, token reduction
   - Development understanding: one bug and resolution, architecture decisions

---

## 16. Aetherfield Design System Integration
Use the provided design system as the visual standard for this blogging platform.

### 16.1 Brand Direction
- Professional, clean, trustworthy, sustainability-inspired
- Strong readability and whitespace

### 16.2 Fonts
- Primary UI font: Poppins
- Secondary editorial/content font: Lora

### 16.3 Core Color Palette
- Sky Blue: #B8D7F0
- Deep Blue: #4A90E2
- Bright Yellow: #FFD966
- Black: #000000
- White: #FFFFFF

### 16.4 UI Components to Align
- Navigation bar
- Hero section
- Post cards
- Buttons (primary black, secondary yellow)
- Labels and badges
- Dashboard metric widgets

### 16.5 Accessibility Rules
- Maintain WCAG-compliant contrast
- Keyboard focus visibility
- Proper semantic headings and alt text

### 16.6 Responsive Rules
- Mobile-first behavior with clear breakpoints
- Listing grid adapts across 1/2/3 columns

---

## 17. Recommended Directory Blueprint (Planning)
This is a target structure to build in implementation phase:

- app/
  - (public)/
  - (auth)/
  - dashboard/
  - posts/
  - admin/
  - api/
- components/
- lib/
- styles/
- supabase/
  - migrations/
- public/
- README.md

---

## 18. Implementation Phases (No Code Yet)

### Phase 1: Project and Auth Foundation
- Initialize Next.js project
- Configure Supabase project and auth
- Add user role synchronization flow

### Phase 2: Schema and Core Post Features
- Create users/posts/comments tables
- Implement post list/detail/create/edit with role checks

### Phase 3: AI Summary Integration
- Add server-side summary generation on create
- Store summary in posts table
- Render summary on listing

### Phase 4: Comments and Admin Controls
- Add comment creation/listing
- Add admin views for all posts/comments

### Phase 5: UX Polish and Deployment
- Apply Aetherfield design system
- Test role-based access and API behavior
- Deploy and verify live app

---

## 19. Risk Register and Mitigation
1. Role mismatch between auth and users table
- Mitigation: run sync-user endpoint on login/session refresh

2. AI API latency or failure
- Mitigation: server timeout and fallback summary handling

3. Unauthorized edits
- Mitigation: strict server-side ownership + role checks

4. Cost overrun due to repeated summary generation
- Mitigation: generate once and persist; no auto-regenerate on fetch/edit

---

## 20. Acceptance Criteria
Project is considered complete when all are true:
1. Three roles work with required permissions
2. Posts support title, image, body, comments
3. Search and pagination function correctly
4. AI summary is generated once on create and stored
5. Admin can manage all posts/comments
6. App is deployed and publicly accessible
7. README contains setup, local run, and deployment documentation
8. Submission includes repository URL, live URL, and required explanation notes

---

## 21. Next Action
If you approve, the next step is to scaffold the actual Next.js + Supabase project in this folder and implement features phase by phase exactly as documented here.
