# Coach Finder - Project Handoff Brief

## Quick Start
- **GitHub:** https://github.com/A1code1/coach-finder
- **Supabase Project ID:** `prvwmdurszhaagbxgato`
- **Status:** MVP complete with Trusted Marketplace theme, 34 seeded coaches, location search, and filters

---

## Project Overview

**Coach Finder** is a web app for discovering and connecting with elite football coaches in the Netherlands.

**Key Features (DONE ✅):**
- Search coaches by location (50 Dutch cities) or nationwide
- Filter by: specialty, age group (kids/teens/adults), gender
- 34 realistic coach profiles with photos
- Trusted Marketplace theme (navy/blue accents), generated with ui-ux-pro-max — see `design-system/coach-finder/MASTER.md`
- Supabase backend with Row-Level Security

**Out of Scope (v1):**
- No booking calendar
- No payments/Mollie integration
- No player accounts/authentication
- No coach comparison table
- No Dutch translation
- No ID/certificate verification

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Email** | Resend (for transactional emails) |
| **Hosting** | Vercel (when ready to deploy) |
| **Design** | Tailwind + custom CSS variables |

---

## Architecture & Key Decisions

### Color Theme: Trusted Marketplace
- **Background:** Light (#f8fafc), white cards
- **Primary accent:** Navy (#0f172a) headings, blue (#0369a1) CTAs
- **Fonts:** Poppins (headings) / Open Sans (body), via `next/font/google`
- **Messaging:** Credibility-first — verified profiles, no hidden fees
- **Tailwind config:** `primary` = navy/blue scale, `accent` = red (favorites/destructive)
- **Source of truth:** `design-system/coach-finder/MASTER.md`, generated with the `ui-ux-pro-max` skill

**Rationale:** This is a marketplace where parents vet coaches for their kids — trust and credibility read stronger than a bold athletic look.

### Location Search
- **Static lookup table** in `constants/dutch-cities.ts` (50 major cities)
- **Haversine distance formula** in `lib/utils.ts` (no external geocoding API)
- **Search radius:** 5km, 10km, 25km, 50km options
- **Nationwide search:** "Show all coaches" checkbox bypasses location filter

**Rationale:** Fast, cost-effective, no API dependency. Static table sufficient for v1.

### Coach Profile Status Lifecycle
```
pending → approved → published (or rejected)
```
Only `approved` coaches show in search (enforced via Supabase RLS policies).

### Database Schema (Supabase)

**coaches table:**
```sql
- id (UUID, PK)
- user_id (UUID, links to auth.users)
- name (text)
- bio (text)
- years_experience (int)
- hourly_rate (decimal)
- age_groups (text[], e.g., ['kids', 'teens'])
- specialties (text[], e.g., ['passing', 'tactics'])
- city (text) — matches dutch-cities.ts name exactly
- training_locations (text[])
- availability (jsonb, structured by day)
- photo_url (text, Supabase Storage URL)
- email (text)
- phone (text)
- gender (text, 'male' | 'female' | null)
- status (text, 'pending' | 'approved' | 'rejected' | 'unpublished')
- rejection_reason (text)
- created_at, updated_at (timestamps)
```

**RLS Policies:**
- Anyone can read `coaches` where `status = 'approved'`
- Only coach (authenticated user) can update own profile
- Admins can update any coach + set status

---

## Current Implementation Status

### ✅ DONE
1. **Homepage (app/page.tsx)**
   - Light "Trusted Marketplace" hero + search-first layout
   - Search form: city input, radius, specialty, age group, gender
   - "Show all coaches" nationwide toggle
   - Trust/safety section (verified profiles, nationwide coverage, no hidden fees)

2. **Search Results (app/search/page.tsx)**
   - Distance filtering (Haversine)
   - Multi-filter support (specialty + age group + gender)
   - Coach cards with photo, rate, bio, tags
   - "No results" fallback

3. **Database**
   - 34 seeded coaches from seed-coaches-final.sql
   - Gender field populated for all coaches
   - Supabase Storage bucket: `coach-photos`
   - RLS policies enforced

4. **Styling**
   - tailwind.config.ts: Trusted Marketplace navy/blue colors + Poppins/Open Sans fonts
   - app/globals.css: Light background, focus-visible outlines, prefers-reduced-motion
   - app/layout.tsx: Light header/footer, SVG logo mark (no emoji)
   - Responsive design (mobile-first)

### ⏳ NOT DONE (v2+)
- Coach detail page (app/coach/[id]/page.tsx) — stub exists
- Coach auth/signup/dashboard
- Admin dashboard
- Contact reveal flow
- Review system
- Email notifications
- Deployment to Vercel

---

## File Structure

```
coach-finder/
├── app/
│   ├── layout.tsx          ← Header/footer (dark theme)
│   ├── page.tsx            ← Homepage search
│   ├── search/page.tsx     ← Results + filtering
│   ├── coach/
│   │   ├── [id]/page.tsx   ← Detail page (stub)
│   │   ├── login/page.tsx  ← Coach auth (stub)
│   │   ├── signup/page.tsx ← Coach signup (stub)
│   │   └── dashboard/      ← Coach panel (stubs)
│   ├── admin/              ← Admin pages (stubs)
│   └── globals.css         ← Dark theme styles
├── constants/
│   ├── dutch-cities.ts     ← 50 cities + lat/lng
│   └── specialties.ts      ← Training specialties
├── lib/
│   ├── supabase.ts         ← Client initialization
│   └── utils.ts            ← Haversine distance
├── types/
│   └── database.ts         ← Coach, ContactReveal, Review, Admin interfaces
├── tailwind.config.ts      ← Athletic Chrome colors
├── database.sql            ← Initial schema + RLS
├── seed-coaches-final.sql  ← 34 coaches (correct names/photos/genders)
├── update-coach-genders.sql ← Gender population script
├── CLAUDE.md               ← Project conventions
└── PROJECT_SPEC.md         ← Full product spec
```

---

## Environment Setup

### For Web Claude

1. **Clone repo:**
   ```bash
   git clone https://github.com/A1code1/coach-finder.git
   cd coach-finder
   npm install
   ```

2. **Create `.env.local`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://prvwmdurszhaagbxgato.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ask maintainer>
   SUPABASE_SERVICE_ROLE_KEY=<ask maintainer>
   RESEND_API_KEY=<ask maintainer>
   ```

3. **Run dev server:**
   ```bash
   npm run dev
   # Opens at http://localhost:3000
   ```

4. **Open in web Claude:**
   - Go to claude.ai/code
   - "Open from GitHub" → https://github.com/A1code1/coach-finder

---

## Key Code Patterns

### Filtering Logic (app/search/page.tsx)
```typescript
// Distance → Specialty → Age Group → Gender
const byDistance = applyHaversineFilter(allCoaches, city, radius);
const bySpecialty = specialty ? filter(byDistance, s => coach.specialties.includes(s)) : byDistance;
const byAgeGroup = ageGroup ? filter(bySpecialty, ag => coach.age_groups.includes(ag)) : bySpecialty;
const byGender = gender ? filter(byAgeGroup, g => coach.gender === gender) : byAgeGroup;
```

### Tailwind Classes (Trusted Marketplace)
- **Primary button:** `bg-primary-600 hover:bg-primary-700 text-white`
- **Card:** `bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg`
- **Heading:** `font-heading text-primary-900 font-bold`

### Supabase Query Pattern
```typescript
const { data, error } = await supabase
  .from("coaches")
  .select("*")
  .eq("status", "approved");
```

---

## Design Philosophy

1. **No external APIs in search path** → Fast, offline-capable
2. **Server-first** → Server Components by default, Client only for forms/interactivity
3. **Direct coach contact** → No booking system, reveal email/phone → coach responds
4. **Simple RLS** → Anyone reads approved; coach edits own; admins full control
5. **Mobile-first** → Start at 375px, scale up
6. **Immutable seeded data** → Don't modify seed scripts; use migrations for schema changes

---

## Next Steps / Open Issues

**High Priority:**
1. Implement coach detail page (`/coach/[id]`)
   - Display full bio, rates, all specialties, schedule
   - Add "Reveal contact info" button (increments counter, emails coach)
   - Show reviews (when review system is done)

2. Coach authentication
   - Login/signup flow
   - Separate coach dashboard to edit profile
   - Photo upload to Supabase Storage

3. Contact reveal flow
   - Player enters email
   - System generates review token
   - Email sent to coach with link to leave review

**Medium Priority:**
4. Review system
   - Player clicks email link to leave 1-5 star + comment
   - Admin approval before publish
   - Display on coach detail page

5. Admin dashboard
   - List all coaches (pending/approved/rejected)
   - Approve/reject signups
   - Manage admins
   - View contact reveals & reviews

6. Email templates (Resend)
   - Signup confirmation
   - Contact reveal (coach receives: "Someone found you")
   - Review link

**Deployment:**
7. Deploy to Vercel
   - Connect GitHub repo
   - Set production env vars
   - Run migrations on prod database

---

## Testing Checklist (for new features)

- [ ] Test on mobile (375px)
- [ ] Test on desktop (1280px)
- [ ] Test with no results
- [ ] Test with 1 result
- [ ] Test with 50+ results
- [ ] Dark/light mode toggle (if added)
- [ ] Keyboard navigation (a11y)
- [ ] No console errors

---

## Questions to Ask

1. **Supabase access:** How to get anon/service role keys?
2. **Resend API:** Already configured? Email template examples?
3. **Future timeline:** When should v2 features (booking, payments) be added?
4. **Monetization:** Will coaches pay to list? Premium tiers?
5. **Scaling:** Expected coach count? City expansion?

---

## Key Contacts / Resources

- **GitHub Repo:** https://github.com/A1code1/coach-finder
- **Supabase Project:** https://app.supabase.com (project ID: prvwmdurszhaagbxgato)
- **Vercel Dashboard:** (when ready to deploy)
- **Tailwind Docs:** https://tailwindcss.com
- **Next.js 15 Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs

---

## Quick Reference: Tailwind Colors

```
Primary (Navy/Blue): primary-{50,100,400,500,600,700,900}  — 600 is the CTA blue, 900 is navy
Accent (Red):         accent-{400,500,600}  — favorites/destructive actions only
Dark (legacy alias):  dark-bg, dark-surface, dark-card, dark-text, dark-textSecondary
                       — repointed to light-theme-safe values; kept only so components
                       that haven't been touched since the redesign still render correctly
```

All defined in `tailwind.config.ts`. Fonts: `font-heading` (Poppins) / default `font-sans` (Open Sans), loaded via `next/font/google` in `app/layout.tsx`.

---

**Ready to build! Start with the coach detail page or coach auth. DM for any questions.** 🚀
