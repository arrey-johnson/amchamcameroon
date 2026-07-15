import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "@/collections/Users";
import { Media } from "@/collections/Media";
import { HeroSlides } from "@/collections/HeroSlides";
import { TickerItems } from "@/collections/TickerItems";
import { News } from "@/collections/News";
import { Events } from "@/collections/Events";
import { Newsletters } from "@/collections/Newsletters";
import { Members } from "@/collections/Members";
import { BoardMembers } from "@/collections/BoardMembers";
import { Committees } from "@/collections/Committees";
import { Pages } from "@/collections/Pages";
import { Submissions } from "@/collections/Submissions";
import { USNews } from "@/collections/USNews";
import { GalleryAlbums } from "@/collections/GalleryAlbums";
import { Settings } from "@/globals/Settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseURI = process.env.DATABASE_URI || "file:./amcham.db";
const usePostgres = databaseURI.startsWith("postgres");

// Local dev → SQLite (zero-setup). Production (Supabase) → Postgres.
// The adapter is chosen automatically from DATABASE_URI.
const db = usePostgres
  ? postgresAdapter({
      pool: { connectionString: databaseURI },
      // Auto-sync the schema on connect so no manual migration step is needed
      // on Vercel. (Use a Supabase "Session" connection string — it supports DDL.)
      push: true,
    })
  : sqliteAdapter({
      // SQLite dev auto-push prompts interactively and stalls in non-TTY shells,
      // so rely on the committed migration instead.
      push: false,
      client: { url: databaseURI },
    });

// Store uploads in Supabase Storage (S3-compatible) when configured — required
// on Vercel, whose filesystem is read-only/ephemeral. Falls back to local disk
// for development when S3_BUCKET is not set.
const storagePlugins = process.env.S3_BUCKET
  ? [
      s3Storage({
        collections: { media: true },
        bucket: process.env.S3_BUCKET,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION || "us-east-1",
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
          },
        },
      }),
    ]
  : [];

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — AmCham Cameroon Admin",
    },
    components: {
      graphics: {
        Logo: "@/components/admin/Logo",
        Icon: "@/components/admin/Icon",
      },
      beforeLogin: ["@/components/admin/BeforeLogin"],
      beforeDashboard: ["@/components/admin/BeforeDashboard"],
    },
  },
  collections: [
    HeroSlides,
    TickerItems,
    News,
    Events,
    Newsletters,
    Members,
    BoardMembers,
    Committees,
    Pages,
    GalleryAlbums,
    USNews,
    Submissions,
    Media,
    Users,
  ],
  globals: [Settings],
  localization: {
    locales: [
      { label: "English", code: "en" },
      { label: "Français", code: "fr" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "dev-secret",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db,
  plugins: [...storagePlugins],
  sharp,
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
});
