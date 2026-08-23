import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { supabaseStorageAdapter } from "@/lib/supabaseStorage";

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
const isLocalPostgres = /localhost|127\.0\.0\.1/.test(databaseURI);

// Local file → SQLite. postgres:// → Postgres (Supabase in this project).
const db = usePostgres
  ? postgresAdapter({
      pool: {
        connectionString: databaseURI,
        // Supabase pooler presents a cert chain Node's pg driver rejects as
        // self-signed when sslmode=require is treated as verify-full.
        ssl: isLocalPostgres ? undefined : { rejectUnauthorized: false },
      },
      push: true,
    })
  : sqliteAdapter({
      // SQLite dev auto-push prompts interactively and stalls in non-TTY shells,
      // so rely on the committed migration instead.
      push: false,
      client: { url: databaseURI },
    });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "media";

// Prefer Supabase Storage REST (service role). Fall back to S3-compatible keys
// if those are set instead. Local disk is used when neither is configured.
const storagePlugins = supabaseUrl && supabaseServiceKey
  ? [
      cloudStoragePlugin({
        collections: {
          media: {
            adapter: supabaseStorageAdapter({
              url: supabaseUrl,
              serviceRoleKey: supabaseServiceKey,
              bucket: supabaseBucket,
            }),
            disableLocalStorage: true,
            disablePayloadAccessControl: true,
          },
        },
      }),
    ]
  : process.env.S3_BUCKET
    ? [
        s3Storage({
          collections: {
            media: {
              disablePayloadAccessControl: true,
              generateFileURL: ({ filename, prefix }) => {
                const key = [prefix, filename].filter(Boolean).join("/");
                return `${process.env.S3_ENDPOINT?.replace(/\/s3$/, "")}/object/public/${process.env.S3_BUCKET}/${key}`;
              },
            },
          },
          bucket: process.env.S3_BUCKET,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION || "eu-central-1",
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
      icons: [
        { type: "image/png", rel: "icon", url: "/favicon-32.png" },
        { type: "image/png", rel: "apple-touch-icon", url: "/apple-icon.png" },
      ],
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
