# Coach Finder - Product Spec (v1 / MVP)

## 1. Overview

Coach Finder is a web app for the Netherlands that helps players find, compare, and contact football coaches by location, training needs, and availability. Coaches list free-standing profiles; players search without needing an account. Site language is English, scoped to Dutch cities/towns.

**Goal of v1:** validate demand with the lowest-friction version possible - no in-app booking, no payments, no player accounts. Prove that players will search, find, and contact coaches, and that coaches will bother listing themselves.

## 2. User roles

### Player
- No account required.
- Can search/browse coaches, view profiles, reveal contact info, leave a review after being prompted.

### Coach
- Requires an account (email + password via Supabase Auth).
- Creates and manages one profile.
- Profile is hidden from search until an admin approves it.

### Admin (you)
- Approves new coach profiles before they go live.
- Basic dashboard to view pending/approved/rejected coaches and moderate reviews.
- No public signup - admin access is a manually flagged Supabase user (or hardcoded email allowlist for v1).

## 3. Core user flows

### 3.1 Player: find a coach
1. Land on homepage - search bar with city/town dropdown + radius selector, plus optional filters (training focus, age group).
2. Results page: list of coach cards (photo, name, rate, city, rating, short bio snippet).
3. Click into a coach profile: full bio, experience, price, training locations, weekly availability, photo gallery, reviews.
4. Click "Show contact info" - optionally prompted for their own email ("get a link to leave a review later") - then phone/email/WhatsApp is revealed.
5. (Optional) Player later receives a review-link email, submits a star rating + text review, which goes into a moderation queue before showing publicly.

### 3.2 Coach: create a profile
1. Sign up with email/password.
2. Fill out profile form: name, bio, years of experience, hourly rate, age groups coached, skill focus/specialties, training location(s) (city/town + optional specific venue name), weekly availability (day/time blocks), photo upload.
3. Submit - profile status = `pending`. Coach sees a "waiting for approval" state on their dashboard.
4. Admin approves - status = `approved` - profile becomes publicly searchable.
5. Coach can edit their profile any time; edits to key fields (TBD: maybe just availability/price don't need re-approval, but major changes do) - for v1, keep it simple: edits go live immediately without re-approval, admin can unpublish if needed.

### 3.3 Admin: moderate
1. Log into `/admin`.
2. See list of pending coach profiles - approve or reject (with optional reason emailed to coach).
3. See list of pending reviews - approve or reject.
4. See list of all live coaches - can unpublish.

## 4. Feature list (v1 scope)

In scope:
- Coach signup/login (Supabase Auth)
- Coach profile creation/edit (bio, experience, rate, age groups, specialties, locations, availability, photos)
- Admin approval workflow for coach profiles
- Player search: city/town + radius, filter by training focus and age group
- Coach results list + individual profile pages
- Reveal-contact-info flow with optional email capture
- Review-via-emailed-link flow, with admin moderation before publishing
- Basic admin dashboard (approve/reject coaches, moderate reviews, unpublish)
- Responsive design (mobile-first, since players will search on phones)

Out of scope for v1 (future versions):
- In-app booking/calendar
- Online payments (Mollie/iDEAL)
- Player accounts, saved favorites, message inbox
- Side-by-side coach comparison
- Multi-language (Dutch translation)
- Coach ID/certificate verification
- Push/SMS notifications

## 5. Data model (Supabase / Postgres)

### `coaches`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK -> auth.users | one profile per coach account |
| name | text | |
| bio | text | |
| years_experience | int | |
| hourly_rate | numeric | in EUR |
| age_groups | text[] | e.g. `{kids, teens, adults}` |
| specialties | text[] | e.g. `{goalkeeping, fitness, technique, tactics}` |
| city | text | Dutch city/town from fixed list |
| training_locations | text[] | free-text venue names |
| availability | jsonb | day/time blocks, e.g. `{mon: ["18:00-20:00"], ...}` |
| photo_urls | text[] | Supabase Storage paths |
| status | text | `pending` \| `approved` \| `rejected` \| `unpublished` |
| rejection_reason | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `contact_reveals`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| coach_id | uuid, FK -> coaches | |
| player_email | text | nullable - only if player opted in |
| review_token | text | nullable - unique token generated if email given |
| created_at | timestamptz | |

### `reviews`
| Field | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| coach_id | uuid, FK -> coaches | |
| contact_reveal_id | uuid, FK -> contact_reveals, nullable | ties review to the reveal that triggered it |
| reviewer_name | text | |
| rating | int | 1-5 |
| comment | text | |
| status | text | `pending` \| `approved` \| `rejected` |
| created_at | timestamptz | |

### `admins`
| Field | Type | Notes |
|---|---|---|
| user_id | uuid, FK -> auth.users | allowlist of admin accounts |

## 6. Pages / routes

- `/` - homepage with search
- `/search` - results list (query params: city, radius, specialty, age_group)
- `/coach/[id]` - coach profile page
- `/review/[token]` - review submission form (from emailed link)
- `/coach/signup`, `/coach/login` - auth
- `/coach/dashboard` - manage own profile, view status
- `/coach/dashboard/edit` - edit profile form
- `/admin/login`
- `/admin/coaches` - approve/reject/unpublish queue
- `/admin/reviews` - moderate reviews

## 7. Location handling

- Fixed list of Dutch cities/towns (start with top ~50-100 by population, expandable).
- Each coach profile stores a primary `city`. Store lat/lng per city (static lookup table) to support radius search without a geocoding API call per search.
- Radius search: given player's selected city + radius (e.g. 5/10/25/50 km), compute distance between city centroids using the Haversine formula - no external maps API needed for v1.

## 8. Notifications (email)

Use Resend (or similar) for transactional email:
- Coach: profile approved / rejected
- Player: review-link email (if they opted in during contact reveal)
- Admin: notified when a new coach profile is submitted for approval (optional, or just check dashboard)

## 9. Design direction

Clean and modern: minimal layout, generous white space, one bold accent color (suggest a football-adjacent green or orange), clear typography, card-based coach listings. Mobile-first responsive layout since most player traffic will be on phones.

## 10. Open questions to resolve during build

- Exact list of Dutch cities/towns to support at launch (all of NL, or start with major cities?)
- Specific specialties/skill-focus taxonomy (finalize the fixed list, e.g. goalkeeping, 1-on-1 technique, youth development, fitness/conditioning, tactics)
- Whether coach edits to an already-approved profile should require re-approval
- Photo upload limits (count, size, moderation)
