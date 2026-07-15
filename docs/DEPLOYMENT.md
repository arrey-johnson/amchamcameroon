# Deployment — GitHub + Vercel + Supabase

This app is a Next.js + Payload server, so it needs a host that runs Node
(**not** GitHub Pages, which only serves static files). The standard, free-tier
path is:

> **GitHub** (code) → **Vercel** (runs the app, auto-deploys on every push) → **Supabase** (Postgres database + file storage)

The code already auto-switches: **SQLite locally**, **Supabase Postgres + Storage in production** — driven entirely by environment variables. You don't change any code to deploy.

---

## 1. Create the Supabase project

1. Go to **https://supabase.com** → **New project**. Choose a region close to your users (e.g. `eu-west-3` / Paris). Save the database password.
2. **Database connection string** — Project → **Connect** → **Session pooler** → copy the URI. It looks like:
   ```
   postgresql://postgres.abcdxyz:YOUR-DB-PASSWORD@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
   ```
   Use the **Session** pooler (port 5432) — it supports the schema sync this app runs on startup.
3. **Storage bucket** — Storage → **New bucket** → name it `media` → set it **Public** (so images load on the site).
4. **S3 access keys** — Project Settings → **Storage** → **S3 Connection** → **New access key**. Copy the **access key**, **secret**, **endpoint** (`https://<ref>.supabase.co/storage/v1/s3`) and **region**.

---

## 2. Prime the database (recommended, from your computer)

This creates the tables, the admin user, and demo content in Supabase in one step, and uploads the images to Supabase Storage — so your first live visit is instant.

Create a temporary `.env.production.local` (or edit `.env`) with the Supabase values:

```env
DATABASE_URI=postgresql://postgres.abcdxyz:PASSWORD@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
PAYLOAD_SECRET=<a long random string>
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
S3_BUCKET=media
S3_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3
S3_REGION=eu-west-3
S3_ACCESS_KEY_ID=<key>
S3_SECRET_ACCESS_KEY=<secret>
```

Then run:

```bash
npm run seed
```

> Prefer a blank site instead? Skip this — Payload shows a "create first admin user" screen the first time you open `/admin` on the live site.

**Restore your local `.env` to SQLite afterwards** (`DATABASE_URI=file:./amcham.db`, empty `S3_BUCKET`) so local dev stays zero-setup.

---

## 3. Push the code to GitHub

```bash
git add -A
git commit -m "AmCham Cameroon website"
git branch -M main
git remote add origin https://github.com/<you>/amcham-website.git
git push -u origin main
```

`.gitignore` already excludes `.env`, `node_modules`, `.next`, the local `amcham.db`, and `/media`, so no secrets or local data are committed.

---

## 4. Deploy on Vercel

1. **https://vercel.com** → **Add New… → Project** → import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings default.
3. **Environment Variables** — add each of these (same values as step 2):

   | Name | Value |
   |------|-------|
   | `DATABASE_URI` | Supabase Session pooler URI |
   | `PAYLOAD_SECRET` | a long random string |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-site.vercel.app` |
   | `RESEND_API_KEY` | your Resend key (optional; empty disables email) |
   | `S3_BUCKET` | `media` |
   | `S3_ENDPOINT` | `https://<ref>.supabase.co/storage/v1/s3` |
   | `S3_REGION` | e.g. `eu-west-3` |
   | `S3_ACCESS_KEY_ID` | Supabase S3 key |
   | `S3_SECRET_ACCESS_KEY` | Supabase S3 secret |

4. **Deploy.** Every future `git push` to `main` redeploys automatically.

---

## 5. After the first deploy

- Open `https://your-site.vercel.app/admin`. If you skipped step 2, create your first admin user here.
- **Change the seeded admin password** (`admin@amchamcam.org` / `ChangeMe!2026`) and set a real notification email in **Settings**.
- Update `NEXT_PUBLIC_SITE_URL` if you add a **custom domain** (Vercel → Settings → Domains), then redeploy.

---

## Email in production (Resend)

1. Create an account at **https://resend.com**, verify your sending domain.
2. Set `RESEND_API_KEY` in Vercel, and in the admin **Settings → Email**, set a verified `fromAddress` (e.g. `AmCham Cameroon <no-reply@amchamcam.org>`).

---

## How it works (for reference)

- `src/payload.config.ts` picks **Postgres** when `DATABASE_URI` starts with `postgres`, otherwise **SQLite**.
- When `S3_BUCKET` is set, uploads go to **Supabase Storage** via the S3 adapter; otherwise they use the local `media/` folder (dev only).
- The Postgres adapter runs with `push: true`, so the schema syncs automatically on connect — no manual migration step on Vercel.

---

## Troubleshooting

- **Images don't appear after upload in production** → `S3_*` vars are missing/incorrect, or the bucket isn't Public. Re-check step 1.4 and the Vercel env vars.
- **500 on first load / "relation does not exist"** → the schema hasn't synced. Run step 2 locally against Supabase once, or hit `/admin` and retry.
- **DB connection errors on Vercel** → make sure you used the **Session pooler** string (port 5432), not the direct `db.<ref>.supabase.co` host (not reachable from Vercel's IPv4).
