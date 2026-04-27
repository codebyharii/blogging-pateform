# Aetherfield Blogging Platform

Live website: https://blogging-pateform.vercel.app/

A modern blogging platform built with Next.js, Supabase Auth, role-based access control, and AI-generated post summaries.

## Features

- Public post listing with search and pagination
- Post details page with comments
- Supabase authentication
- Email/password login
- Google OAuth login
- Role-based access control
- Viewer, author, and admin roles
- Admin dashboards for posts and comments
- AI-generated summaries for posts
- Responsive UI for desktop and mobile
- Footer and polished navigation

## Tech Stack

- Next.js 16
- TypeScript
- Supabase
- Tailwind CSS v4
- Google OAuth
- Google Gemini API

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - Shared UI components
- `lib/` - Supabase clients, auth helpers, utilities
- `supabase/` - Database seed and migration files

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
