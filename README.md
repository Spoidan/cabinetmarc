# Cabinet MARC — Modern Website

A complete, production-ready redesign of cabinetmarc.org built with Next.js 15, TypeScript, Tailwind CSS, Clerk, and Supabase.

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 16 (App Router) | Framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Clerk v7 | Authentication |
| Supabase | Database + Storage |
| Framer Motion | Animations |
| next-intl | i18n (FR/EN) |
| Resend | Email |
| React Hook Form + Zod | Forms |

## Quick Start

### 1. Install dependencies

```bash
cd C:/Projects/cabinet-marc
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
copy .env.example .env.local
```

Fill in:
- **Clerk**: publishable key + secret key from [clerk.com](https://clerk.com)
- **Supabase**: URL + anon key + service role from [supabase.com](https://supabase.com)
- **ADMIN_USER_IDS**: your Clerk user ID (find it in Clerk dashboard after first sign-in)
- **Resend** (optional): API key from [resend.com](https://resend.com) for emails

### 3. Setup Supabase

Run the schema in your Supabase SQL editor:

```sql
-- Copy and run: supabase/schema.sql
```

This creates all tables + seed data (categories, testimonials, nav items, etc.)

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
cabinet-marc/
├── app/
│   ├── page.tsx                    # Home page
│   ├── (marketing)/                # Public pages (Navbar+Footer)
│   │   ├── about/
│   │   ├── courses/[slug]/
│   │   ├── services/
│   │   ├── team/
│   │   ├── blog/[slug]/
│   │   ├── contact/
│   │   ├── privacy/ & terms/
│   │   └── layout.tsx              # Marketing layout
│   ├── (auth)/                     # Sign-in / Sign-up pages
│   ├── (dashboard)/dashboard/      # User dashboard
│   ├── (admin)/admin/              # Admin panel (protected)
│   │   ├── page.tsx                # Dashboard overview
│   │   ├── content/                # Content editor
│   │   ├── courses/                # Course management
│   │   ├── team/                   # Team management
│   │   ├── media/                  # Media manager
│   │   └── settings/               # Global settings
│   └── api/                        # API routes
├── components/
│   ├── ui/                         # Button, Card, Input, etc.
│   ├── layout/                     # Navbar, Footer
│   ├── sections/                   # Hero, Stats, CourseCategories, etc.
│   ├── admin/                      # Admin sidebar, header
│   └── providers.tsx               # Clerk + React Query + Theme
├── lib/
│   ├── utils.ts
│   ├── constants.ts
│   ├── supabase.ts
│   └── admin.ts                    # Admin auth guard
├── types/                          # index.ts + supabase.ts
├── messages/fr.json + en.json      # Translations
├── i18n/request.ts                 # next-intl config
└── supabase/schema.sql             # Database schema
```

## Admin Panel

Visit `/admin` (requires admin Clerk user ID in `ADMIN_USER_IDS`).

| Section | What you can edit |
|---------|------------------|
| Dashboard | Overview stats |
| Content | Every page section (hero title, subtitle, CTAs, descriptions, etc.) |
| Formations | Add/edit/delete courses and categories |
| Équipe | Add/edit/delete team members |
| Médias | Upload images/videos to Supabase Storage |
| Paramètres | Site name, colors, SEO meta, social links, contact info, email settings |

## Pages

| URL | Page |
|-----|------|
| `/` | Home (hero, stats, about, categories, testimonials, contact CTA) |
| `/about` | About — mission, vision, values, timeline |
| `/courses` | Courses with category filter |
| `/courses/[slug]` | Course detail |
| `/services` | Consulting, training, research, e-learning |
| `/team` | Expert profiles |
| `/blog` | Blog listing |
| `/contact` | Contact form |
| `/dashboard` | User dashboard (authenticated) |
| `/admin` | Admin panel (admin role) |

## Deployment

```bash
# Build
npm run build

# Deploy to Vercel
npx vercel
```

Add environment variables in your hosting dashboard.

---

© 2024 Cabinet MARC. All rights reserved.
