# Supabase SQL (SQL Editor)

## On this project (`amcham` / `ibzobgpwprzxdchbjjju`)

Schema is **already applied**. Do **not** run `20260820_payload_schema.sql` again or you will see:

`ERROR: 42710: type "_locales" already exists`

Optional (idempotent):

1. `20260820_amcham_app_role.sql` — ensures the `amcham_app` login exists

## On a brand-new empty Supabase project only

1. `20260820_amcham_app_role.sql`
2. `20260820_payload_schema.sql`
3. From the app: set `.env` `DATABASE_URI`, then `npm run seed`
