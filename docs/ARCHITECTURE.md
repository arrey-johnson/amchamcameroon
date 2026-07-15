# Architecture

This document explains how the AmCham Cameroon website is organized, where the **frontend** ends and the **backend** begins, and how a request flows through the app.

## Big picture

It is **one Next.js application** that plays two roles:

```
                         ┌──────────────────────────────────────────┐
   Visitor ── HTTP ────▶ │  Next.js (React Server Components)        │
                         │  ─ FRONTEND: renders public pages on the  │
                         │    server → fast first paint + SEO        │
                         └───────────────┬──────────────────────────┘
                                         │  reads/writes via Payload Local API
                         ┌───────────────▼──────────────────────────┐
   Staff ── /admin ────▶ │  Payload CMS (BACKEND)                    │
                         │  ─ Admin panel (CRUD UI)                  │
                         │  ─ Access control (roles)                 │
                         │  ─ REST + GraphQL API                     │
                         └───────────────┬──────────────────────────┘
                                         │
                         ┌───────────────▼──────────────────────────┐
                         │  Database (SQLite → Postgres) + Media     │
                         └──────────────────────────────────────────┘
```

Because both halves share one database, **any change staff make in the admin appears on the public site immediately** — no rebuild, no redeploy. The public pages are set to render dynamically (`export const dynamic = "force-dynamic"` in the locale layout) so they always show the latest content.

Yes, this is already **React + Node**: Next.js renders your React components, and Next + Payload run on Node.js. The frontend and backend are cleanly separated by folder (below) but deploy as one unit — that's the design that gives you SSR/SEO *and* a live CMS without running two servers.

---

## Folder-by-folder

### Frontend (the public website)

| Path | Role |
|------|------|
| `src/app/(frontend)/[locale]/` | Every public page. `[locale]` is `en` or `fr`. `page.tsx` = homepage; subfolders = routes (`about/board`, `news/[slug]`, `events`, `membership/apply`, …). |
| `src/app/(frontend)/[locale]/layout.tsx` | Public shell: header, footer, ticker, floating WhatsApp/call stack, fonts, `<html>`. |
| `src/components/` | All public UI, grouped by area: `layout/` (header, footer, nav, ticker), `home/` (hero slider, news tabs, logo wall), `cards/`, `forms/`, `members/`, `gallery/`, `ui/`. |
| `src/i18n/` + `src/messages/` | Bilingual routing (`next-intl`) and the EN/FR **interface** string catalogs (`en.json`, `fr.json`). |
| `src/app/globals.css` | Brand tokens (navy `#232E7D`, red `#E30613`, green, gold) + Tailwind + animations. |
| `src/app/sitemap.ts`, `robots.ts` | SEO. Structured data (Organization/Article) lives in the layout + article pages. |
| `middleware.ts` | Locale detection & routing. |

### Backend (CMS, admin, API, data)

| Path | Role |
|------|------|
| `src/payload.config.ts` | **The heart of the backend.** Registers collections, globals, the DB adapter, localization (EN/FR), and admin customizations. |
| `src/collections/` | The data model — **one file per content type** (`News.ts`, `Events.ts`, `Members.ts`, `Pages.ts`, `BoardMembers.ts`, `Committees.ts`, `Newsletters.ts`, `HeroSlides.ts`, `TickerItems.ts`, `GalleryAlbums.ts`, `USNews.ts`, `Submissions.ts`, `Media.ts`, `Users.ts`). Each defines fields, access rules, and admin display. |
| `src/globals/Settings.ts` | Singleton site settings: contacts, phones, WhatsApp/call numbers, socials, email templates, homepage stats, SEO defaults. |
| `src/access/index.ts` | Reusable role-based access rules (`superAdmins`, `editors`, `anyStaff`, `publishedOrStaff`, …). Roles: **Super Admin / Editor / Contributor**. |
| `src/app/(payload)/` | Admin panel routes (`/admin`) + REST/GraphQL API (`/api`). Mostly Payload-generated glue; `admin-theme.css` is our custom styling. |
| `src/components/admin/` | Custom admin UI: branded `Logo`/`Icon`, `BeforeLogin`, the modern KPI `BeforeDashboard`, and the light/dark `ThemeToggle`. |
| `src/app/actions.ts` | Server actions for the **public forms** (contact, membership, subscribe): validate → save to `submissions` → send emails. Rate-limited + honeypot. |
| `src/lib/queries.ts` | Typed data-access functions the frontend uses to read from Payload (the seam between frontend and backend). |
| `src/lib/email.ts` | Resend integration: branded auto-reply + admin notification. |
| `src/scripts/` | `seed.ts` (populates the DB) + `assets/` (real photos) + image/PDF generators. |
| `src/migrations/` | Database schema migrations. |

### Shared

| Path | Role |
|------|------|
| `src/lib/utils.ts` | Formatting (dates, media URLs), helpers. |
| `src/lib/payload.ts` | Cached Payload client accessor. |
| `src/payload-types.ts` | **Auto-generated** TypeScript types for every collection — used by both halves. Regenerate with `npm run generate:types`. |

---

## Request lifecycle

**A visitor opens a page:**
1. `middleware.ts` resolves the locale (`en`/`fr`).
2. The matching Server Component in `(frontend)/[locale]/…/page.tsx` runs on the server.
3. It calls a function in `src/lib/queries.ts`, which uses the Payload **Local API** to read from the database directly (no network hop).
4. React renders HTML on the server and streams it to the browser → fast, SEO-friendly.

**A visitor submits a form:**
1. The form (client component in `src/components/forms/`) calls a server action in `src/app/actions.ts`.
2. The action validates, saves a `submissions` record (Payload Local API), and calls `src/lib/email.ts` (Resend) to send the auto-reply + admin notification.

**Staff edit content:**
1. They use the admin panel at `/admin` (Payload).
2. Payload writes to the same database.
3. The next public request reads the updated data — changes are live immediately.

---

## Data model (collections)

All content collections are **localized (EN/FR)** and, where noted, support **drafts**.

| Collection | Purpose | Drafts |
|------------|---------|:------:|
| `hero-slides` | Homepage banner carousel | — |
| `ticker-items` | Sliding news-ticker headlines | — |
| `news` | Articles / press releases / op-eds / policy | ✓ |
| `events` | Upcoming & past events, trade missions, galleries | ✓ |
| `newsletters` | PDF newsletter archive | — |
| `members` | Member companies (directory + logo wall) | — |
| `board-members` | Board of Directors & Executive Office | — |
| `committees` | Working committees | — |
| `pages` | Static page copy (About, Mission, Benefits…) | ✓ |
| `gallery-albums` | Photo albums | — |
| `us-news` | Curated U.S. business headlines | — |
| `submissions` | Contact / membership / subscribe inbox | — |
| `media` | Reusable image & PDF library | — |
| `users` | Admin users (roles) | — |
| `settings` (global) | Site-wide configuration | — |

---

## Switching to Postgres (production)

SQLite is the default (simple, zero-setup, great for local/single-instance). For production, switch to Postgres (Supabase/Neon):

```bash
npm i @payloadcms/db-postgres
```

In `src/payload.config.ts`:

```ts
// remove: import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";

// replace the db: {...} block with:
db: postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URI },
}),
```

Then set `DATABASE_URI` to your Postgres URL and run `npx payload migrate`. Content and queries are unchanged — only the adapter differs.
