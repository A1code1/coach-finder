# CLAUDE.md

This file gives Claude Code context on the Coach Finder project. See `PROJECT_SPEC.md` in this same folder for the full product spec (data model, user flows, pages) - read that first when starting work.

## Project

Coach Finder - a web app for the Netherlands to find, compare, and contact football coaches by location, training needs, and availability. English language, NL-only. v1 has no in-app booking or payments - contact is via revealing the coach's info, and reviews happen through an emailed link.

## Tech stack

- **Framework:** Next.js (App Router), TypeScript
- **Database/Auth/Storage:** Supabase (Postgres, Supabase Auth for coaches, Supabase Storage for profile photos)
- **Styling:** Tailwind CSS
- **Email:** Resend (or similar) for transactional emails (approval notices, review-link emails)
- **Hosting:** Vercel
- **Deployment:** GitHub -> Vercel CI/CD

## Project conventions

- Use the Next.js App Router (`app/` directory), not Pages Router.
- Server Components by default; use Client Components only where interactivity requires it (forms, filters, dashboards).
- Supabase client: server-side calls via server components/route handlers where possible; avoid leaking the service role key to the client.
- Coach profile status lifecycle: `pending -> approved -> unpublished/rejected`. New signups always start `pending`. Never make a profile publicly searchable until `status = 'approved'`.
- Location search uses static city/lat-lng lookup + Haversine distance calculation - no external geocoding API calls in the search path for v1.
- Keep the player experience account-free. Do not add player login/auth in v1 - if a feature seems to need it, flag it instead of building it, since it's out of scope per the spec.
- Mobile-first responsive design - build and test at mobile breakpoints first.

## Environment variables (expected)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

## What NOT to build in v1

Refer to PROJECT_SPEC.md section 4 ("Out of scope"). Specifically: no booking calendar, no payments/Mollie integration, no player accounts, no coach comparison table, no Dutch translation, no ID/certificate verification upload. If a request seems to drift into these, check with the user before building.

## Commands

(Fill in once the project is scaffolded, e.g. `npm run dev`, `npm run build`, `npm run lint`.)

## Admin access

There is no public admin signup. Admin accounts are identified via an `admins` table (allowlist of `user_id`s from `auth.users`). Do not build a public "become an admin" flow.
