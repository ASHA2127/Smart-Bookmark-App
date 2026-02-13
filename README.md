
# Smart Bookmark App

A simple, real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Google OAuth Only**: Sign up and log in securely with your Google account.
- **Private Bookmarks**: Each user has their own private list of bookmarks.
- **Real-time Updates**: Bookmarks update instantly across all open tabs when added or deleted.
- **CRUD Operations**: Add and delete bookmarks with ease.
- **Responsive Design**: Built with Tailwind CSS for a modern look on all devices.

## Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### 1. Prerequisites

- A Supabase project.
- A Google Cloud Console project (for Google OAuth).

### 2. Supabase Setup

Run the following SQL in your Supabase SQL Editor to create the `bookmarks` table and enable RLS:

```sql
-- Create bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- Create Policies
create policy "Users can view their own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- Enable Realtime for bookmarks table
alter publication supabase_realtime add table bookmarks;
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the App

```bash
npm run dev
```

## Problems Encountered & Solutions

### 1. PowerShell Execution Policy
**Problem**: While initializing the project, PowerShell blocked `npx` and `npm` scripts due to execution policies.
**Solution**: Used `.cmd` extensions (`npx.cmd`, `npm.cmd`) to bypass the script block and successfully install dependencies.

### 2. Supabase SSR Auth
**Problem**: Managing auth sessions in Next.js App Router requires careful handling of cookies between client and server components.
**Solution**: Implemented the `@supabase/ssr` package with a robust middleware and server client configuration that synchronizes cookies correctly across the app.

### 3. Real-time Synchronization
**Problem**: Requirements specified that bookmarks should update in real-time across different tabs without page refreshes.
**Solution**: Leveraged Supabase's Realtime engine by subscribing to `postgres_changes` on the `bookmarks` table. The frontend updates its local state immediately upon receiving events from Supabase, ensuring all tabs stay in sync.

### 4. Google OAuth Redirects
**Problem**: Hardcoding redirect URLs for OAuth can lead to issues when moving between local development and production (Vercel).
**Solution**: Dynamically determined the origin using Next.js `headers()` in server actions to ensure the OAuth flow redirects to the correct environment automatically.

## Deployment

This app is ready to be deployed on **Vercel**. Ensure you add the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.

# Smart-Bookmark-App
A fullstack Smart Bookmark application built with Next.js (App Router), Supabase (Auth, Database, Realtime) and Tailwind CSS. Supports Google OAuth login, private bookmarks, real-time updates, and deployment on Vercel.

