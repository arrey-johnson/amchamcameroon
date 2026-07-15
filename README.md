# AmCham Cameroon — Website

The official website of the **American Chamber of Commerce in Cameroon (AmCham Cameroon)** — a premium, fully bilingual (English / French) site backed by a no-code admin panel where staff manage every banner, news item, event, newsletter, member, committee and page.

- **Frontend:** Next.js 15 (App Router, React Server Components) + Tailwind CSS
- **Backend / CMS:** Payload CMS 3 (runs inside the same Next.js app) + SQLite (swap-ready for Postgres)
- **Bilingual:** `next-intl` (EN / FR), plus localized content fields in the CMS
- **Email:** Resend (auto-reply + admin notification on every form submission)

> **One app, two halves.** This is a single Next.js project that contains **both** the public frontend and the backend/CMS. React renders the pages on the server (great for SEO and fast first paint), and Payload provides the admin panel + database + REST/GraphQL API. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full frontend ↔ backend map.

---

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:3000** — the public site.
Open **http://localhost:3000/admin** — the admin panel.

> ⚠️ The **first load of each page in `npm run dev` is slow** (5–20 s) because Next.js compiles routes on demand in development. This does **not** affect the deployed site — production pages respond in ~40–270 ms. Always judge performance from `npm run build && npm start`, never from `dev`.

### Admin login (seeded)

| | |
|---|---|
| URL | `http://localhost:3000/admin` |
| Email | `admin@amchamcam.org` |
| Password | `ChangeMe!2026` |

**Change this password before going live** (admin → avatar → Account), and set a real inbox email so password resets work.

---

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server (slow first compile — see note above) |
| `npm run build` | Production build (run this to check real performance) |
| `npm start` | Serve the production build |
| `npm run seed` | Wipe & re-seed the database with bilingual demo/real content |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after changing collections |
| `npm run generate:importmap` | Regenerate the admin import map after adding admin components |
| `npm run lint` | ESLint |

### Database setup (first run)

The database schema is applied via **migrations** (not dev auto-push, which stalls in non-interactive shells):

```bash
npx payload migrate      # create tables
npm run seed             # populate content + admin user
```

---

## Project structure (frontend vs. backend)

```
src/
├── app/
│   ├── (frontend)/[locale]/   FRONTEND — every public page (home, about, news, events…)
│   ├── (payload)/             BACKEND  — admin panel routes + REST/GraphQL API
│   ├── actions.ts             BACKEND  — server actions for the public forms
│   ├── globals.css            FRONTEND — brand tokens & global styles
│   └── sitemap.ts / robots.ts SEO
│
├── components/                FRONTEND — all React UI
│   ├── layout/  home/  cards/  forms/  members/  gallery/  ui/
│   └── admin/                 BACKEND  — custom admin dashboard UI (branding + KPIs)
│
├── collections/               BACKEND  — CMS schema: one file per content type
├── globals/Settings.ts        BACKEND  — site-wide settings (contacts, socials, email…)
├── access/                    BACKEND  — role-based access control
├── lib/                       SHARED   — queries (data access), email, utils
├── i18n/  messages/           FRONTEND — bilingual routing + UI string catalogs
├── scripts/                   BACKEND  — seed script + real image assets
├── migrations/                BACKEND  — database migrations
├── payload.config.ts          BACKEND  — CMS configuration (collections, DB, admin)
└── middleware.ts              locale routing
```

Full details, data model, and the request lifecycle: **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)**.

---

## Managing content

Everything on the public site is editable in the admin with no code — it's a full **CRUD** interface for every content type:

- **Homepage** → Hero Slides, News Ticker
- **Pressroom** → News, Newsletters, Photo Gallery, U.S. Business News
- **Programs** → Events, Committees
- **People** → Members (directory + logo wall), Leadership (Board & Executive)
- **Site** → Pages (About/Mission/Benefits rich text), Settings, Media library
- **Inbox** → Contact / membership / subscription submissions

All content is **bilingual**: use the **language switcher (top-right)** while editing to fill the English and French versions. Published changes appear on the site immediately (the site reads live from the same database).

---

## Configuration (`.env`)

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URI` | SQLite file (default) or Postgres connection string |
| `PAYLOAD_SECRET` | Secret used to sign admin sessions — **set a strong value in production** |
| `NEXT_PUBLIC_SITE_URL` | Public URL (used in emails, SEO, sitemap) |
| `RESEND_API_KEY` | Enables transactional email. Leave empty to disable sending (forms still save to the DB) |

---

## Deployment (GitHub → Vercel → Supabase)

The app **auto-switches** to Supabase Postgres + Supabase Storage in production —
no code changes needed. Local dev stays on SQLite. Just set the environment
variables on the host.

**Full step-by-step:** **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)** — create the
Supabase project, get the connection string + storage keys, push to GitHub,
import into Vercel, set env vars, done.

**Before launch:** change the admin password + notification email, set a strong
`PAYLOAD_SECRET`, and add a real `RESEND_API_KEY` + verified sender.
