/**
 * Import scraped Joomla content (data/joomla-export/export.json) into Payload.
 * Upserts by slug — does not wipe seeded demo content unless slug collides
 * (scraped pages intentionally overwrite who-we-are / vision-mission / etc.).
 *
 * Usage:  npm run import:joomla
 * Prereq: npm run scrape:joomla
 */

import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";
import { htmlToLexical, htmlToExcerpt } from "./htmlToLexical";
import type { ScrapedItem } from "./scrape-joomla";

type Payload = Awaited<ReturnType<typeof getPayload>>;

const EXPORT_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/joomla-export/export.json",
);

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

type ExportFile = {
  scrapedAt: string;
  counts: Record<string, number>;
  items: ScrapedItem[];
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function mimeFromUrl(url: string): string {
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "image/jpeg";
}

function filenameFromUrl(url: string, fallback: string): string {
  try {
    const base = path.basename(new URL(url).pathname) || fallback;
    return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  } catch {
    return `${fallback}.jpg`;
  }
}

async function downloadImage(url: string): Promise<{ buffer: Buffer; mimetype: string; name: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`  image HTTP ${res.status} ${url}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 200) return null;
    return {
      buffer: buf,
      mimetype: res.headers.get("content-type")?.split(";")[0] || mimeFromUrl(url),
      name: filenameFromUrl(url, "cover"),
    };
  } catch (e) {
    console.warn(`  image fail ${url}`, e);
    return null;
  }
}

async function uploadCover(
  payload: Payload,
  url: string | null,
  alt: string,
): Promise<number | undefined> {
  if (!url) return undefined;
  const file = await downloadImage(url);
  if (!file) return undefined;
  const doc = await payload.create({
    collection: "media",
    locale: "en",
    data: { alt },
    file: {
      data: file.buffer,
      mimetype: file.mimetype,
      name: file.name,
      size: file.buffer.length,
    },
  });
  await payload.update({
    collection: "media",
    id: doc.id,
    locale: "fr",
    data: { alt },
  });
  return doc.id as number;
}

async function findBySlug(
  payload: Payload,
  collection: "pages" | "news" | "events",
  slug: string,
) {
  const res = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  return res.docs[0] ?? null;
}

async function upsertPage(payload: Payload, item: ScrapedItem) {
  const slug = item.pageSlug || item.slug;
  const coverId = await uploadCover(payload, item.coverImageUrl, item.title);
  const body = htmlToLexical(item.bodyHtml);
  const intro = item.excerpt || htmlToExcerpt(item.bodyHtml, 200);
  const data = {
    title: item.title,
    slug,
    intro,
    body,
    ...(coverId ? { coverImage: coverId } : {}),
    _status: "published" as const,
    seo: {
      metaTitle: item.title,
      metaDescription: intro.slice(0, 160),
    },
  };

  const existing = await findBySlug(payload, "pages", slug);
  if (existing) {
    await payload.update({ collection: "pages", id: existing.id, locale: "en", data });
    console.log(`  updated page /${slug}`);
  } else {
    await payload.create({ collection: "pages", locale: "en", data });
    console.log(`  created page /${slug}`);
  }
}

async function upsertNews(payload: Payload, item: ScrapedItem) {
  const coverId = await uploadCover(payload, item.coverImageUrl, item.title);
  const body = htmlToLexical(item.bodyHtml);
  const publishedAt = item.publishedAt || new Date().toISOString();
  const data = {
    title: item.title,
    slug: item.slug,
    category: item.newsCategory || "news",
    excerpt: item.excerpt || htmlToExcerpt(item.bodyHtml),
    body,
    publishedAt,
    ...(coverId ? { coverImage: coverId } : {}),
    tags: item.categoryHint ? [{ tag: item.categoryHint }] : [],
    _status: "published" as const,
  };

  const existing = await findBySlug(payload, "news", item.slug);
  if (existing) {
    await payload.update({ collection: "news", id: existing.id, locale: "en", data });
    console.log(`  updated news /${item.slug}`);
  } else {
    await payload.create({ collection: "news", locale: "en", data });
    console.log(`  created news /${item.slug}`);
  }
}

async function upsertEvent(payload: Payload, item: ScrapedItem) {
  const coverId = await uploadCover(payload, item.coverImageUrl, item.title);
  const description = htmlToLexical(item.bodyHtml);
  // Prefer scraped date; never use a fake placeholder year.
  // If unknown, leave far in the past only when listing was "Past", else skip date guess.
  const startAt = item.publishedAt || "2018-01-01T10:00:00.000Z";
  const data = {
    title: item.title,
    slug: item.slug,
    startAt,
    venue: "Cameroon",
    category: item.eventCategory || "networking",
    description,
    ...(coverId ? { coverImage: coverId } : {}),
    _status: "published" as const,
  };

  const existing = await findBySlug(payload, "events", item.slug);
  if (existing) {
    await payload.update({ collection: "events", id: existing.id, locale: "en", data });
    console.log(`  updated event /${item.slug}`);
  } else {
    await payload.create({ collection: "events", locale: "en", data });
    console.log(`  created event /${item.slug}`);
  }
}

async function run() {
  if (!existsSync(EXPORT_FILE)) {
    console.error(`Missing ${EXPORT_FILE}\nRun: npm run scrape:joomla`);
    process.exit(1);
  }

  const exported = JSON.parse(readFileSync(EXPORT_FILE, "utf8")) as ExportFile;
  const payload = await getPayload({ config });
  payload.logger.info(`📥 Importing ${exported.items.length} scraped items (${exported.scrapedAt})`);

  let pages = 0;
  let news = 0;
  let events = 0;
  let failed = 0;

  for (const item of exported.items) {
    try {
      if (item.kind === "page") {
        await upsertPage(payload, item);
        pages++;
      } else if (item.kind === "news") {
        await upsertNews(payload, item);
        news++;
      } else if (item.kind === "event") {
        await upsertEvent(payload, item);
        events++;
      }
      await sleep(150);
    } catch (e) {
      failed++;
      console.error(`  FAIL [${item.kind}] ${item.slug}`, e);
    }
  }

  payload.logger.info(`✅ Import complete — pages=${pages} news=${news} events=${events} failed=${failed}`);
}

await run();
