# Coach Finder

A web app for finding, comparing, and contacting football coaches in the Netherlands.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the contents of `database.sql` to set up tables and RLS policies
3. Copy your project URL and keys from Settings > API

### 3. Environment Variables

Create a `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
```

### 4. Set Up Admin Account

In Supabase:
1. Go to Authentication > Users and create an admin user (or use an existing one)
2. Copy their User ID
3. Go to SQL Editor and run:
```sql
INSERT INTO admins (user_id) VALUES ('ADMIN_USER_ID_HERE');
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Player Search**: Find coaches by location, specialty, and age group
- **Coach Profiles**: Coaches can create and manage their profiles
- **Admin Moderation**: Approve/reject coach profiles before they go live
- **Review System**: Players can leave reviews via emailed links

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- Resend (Email)

## Key Routes

- `/` - Homepage with search
- `/search?city=...&radius=...` - Search results
- `/coach/[id]` - Coach profile
- `/coach/signup` - Coach registration
- `/coach/login` - Coach login
- `/coach/dashboard` - Coach dashboard
- `/coach/dashboard/create` - Create profile
- `/coach/dashboard/edit` - Edit profile
- `/admin/login` - Admin login
- `/admin/coaches` - Admin coach moderation
- `/admin/reviews` - Admin review moderation (to be built)
