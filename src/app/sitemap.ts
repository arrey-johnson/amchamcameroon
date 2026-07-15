import type { MetadataRoute } from "next";
import { getPayloadClient } from "@/lib/payload";

const STATIC_PATHS = [
  "",
  "/about/who-we-are",
  "/about/vision-mission",
  "/about/word-from-the-us-embassy",
  "/about/word-from-the-president",
  "/about/board",
  "/about/executive",
  "/membership",
  "/membership/categories",
  "/membership/directory",
  "/membership/apply",
  "/committees",
  "/events",
  "/news",
  "/newsletters",
  "/gallery",
  "/us-news",
  "/resources",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const locales = ["en", "fr"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    const prefix = locale === "en" ? "" : `/${locale}`;
    for (const path of STATIC_PATHS) {
      entries.push({ url: `${base}${prefix}${path}`, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 });
    }
  }

  try {
    const payload = await getPayloadClient();
    const [news, events, committees] = await Promise.all([
      payload.find({ collection: "news", limit: 500, depth: 0 }),
      payload.find({ collection: "events", limit: 500, depth: 0 }),
      payload.find({ collection: "committees", limit: 100, depth: 0 }),
    ]);
    for (const locale of locales) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      news.docs.forEach((n) => entries.push({ url: `${base}${prefix}/news/${n.slug}`, changeFrequency: "monthly", priority: 0.6 }));
      events.docs.forEach((e) => entries.push({ url: `${base}${prefix}/events/${e.slug}`, changeFrequency: "monthly", priority: 0.6 }));
      committees.docs.forEach((c) => entries.push({ url: `${base}${prefix}/committees/${c.slug}`, changeFrequency: "monthly", priority: 0.5 }));
    }
  } catch {
    // DB not ready — return static entries only.
  }

  return entries;
}
