/**
 * Scrape public AmCham content from the legacy Joomla site (amchamcam.org/ac).
 * Writes data/joomla-export/export.json — run import-joomla.ts next.
 *
 * Usage:  npx tsx src/scripts/scrape-joomla.ts
 *    or:  npm run scrape:joomla
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const BASE = "https://amchamcam.org";
const AC = `${BASE}/ac`;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data/joomla-export");

/** Categories / seed pages that hold real AmCham content (not Joomla demo). */
const SEED_URLS = [
  // About / chamber
  `${AC}/index.php`,
  `${AC}/index.php/the-chamber/our-mission`,
  `${AC}/index.php/the-chamber/word-from-the-u-s-embassy`,
  `${AC}/index.php/the-chamber/2015-12-05-11-13-56`,
  `${AC}/index.php/2015-12-05-11-08-51/who-can-join`,
  // Category listings
  `${AC}/index.php?option=com_content&view=category&layout=blog&id=87&limit=100`,
  `${AC}/index.php?option=com_content&view=category&layout=blog&id=88&limit=100`,
  `${AC}/index.php?option=com_content&view=category&layout=blog&id=90&limit=100`,
  `${AC}/index.php?option=com_content&view=category&layout=blog&id=93&limit=100`,
  `${AC}/index.php?option=com_content&view=category&layout=blog&id=99&limit=100`,
  `${AC}/index.php/2015-12-05-11-43-14/2021-09-08-00-01-42`, // upcoming events
  `${AC}/index.php/2015-12-05-11-43-14/2021-09-08-00-02-20`, // past events
  `${AC}/index.php/2015-12-05-11-13-05/2021-09-08-00-06-51`, // press release
  `${AC}/index.php/99-newsletter`,
  `${AC}/index.php/2015-12-05-11-43-14`,
];

const SKIP_PATH_RE =
  /joomla|park-site|fruit-shop|sampledata|australian-parks|getting-started|banner-module|archive-module|article-categories|professionals|administrator-components|content-slider|authentication|editors-xtd|feed-display|custom-html-module|page-builder|jsn-extended|sample-article|template-s-articles|vel-illum|site-map|\/107-test\b|usefull-links/i;

const SKIP_TITLE_RE =
  /^(content slider|professionals|administrator components|archive module|article categories|articles category|banner module|custom html|feed display|australian parks|first blog post|second blog post|directions|fruit shop|happy orange|getting started|contacts amcham cameroon|usefull links|page builder|jsn extended|sample article|test|site map|members showcase|upcoming events|past events|events|membership)$/i;

/** Category/menu labels that appear as H1 instead of the real article title. */
const GENERIC_TITLE_RE =
  /^(who are we\s*\??|upcoming events|past events|events|members showcase|press release|newsletter|membership|home)$/i;

export type ScrapedKind = "page" | "news" | "event" | "skip";

export type ScrapedItem = {
  sourceUrl: string;
  kind: ScrapedKind;
  slug: string;
  title: string;
  publishedAt: string | null;
  excerpt: string;
  bodyHtml: string;
  coverImageUrl: string | null;
  imageUrls: string[];
  categoryHint: string | null;
  eventCategory?: "conference" | "networking" | "trade-mission" | "training" | "gala";
  newsCategory?: "news" | "press-release" | "op-ed" | "policy";
  pageSlug?: string;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      console.warn(`  HTTP ${res.status} ${url}`);
      return null;
    }
    return await res.text();
  } catch (e) {
    console.warn(`  FETCH FAIL ${url}`, e);
    return null;
  }
}

function absUrl(href: string | undefined | null): string | null {
  if (!href) return null;
  if (href.startsWith("//")) return `https:${href}`;
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `${BASE}${href}`;
  return `${AC}/${href.replace(/^\.\//, "")}`;
}

function slugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "item";
    // Joomla: 224-osac-country-council-meeting or who-can-join
    const cleaned = last
      .replace(/^\d+-/, "")
      .replace(/\.html?$/i, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return cleaned || "item";
  } catch {
    return `item-${Date.now()}`;
  }
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function pickTitle($: ReturnType<typeof cheerio.load>, url: string): string {
  // 1) Document <title> is usually the real article title on this Joomla site
  const docTitle = decodeHtmlEntities($("title").first().text() || "")
    .split("|")[0]
    .split(" - AmCham")[0]
    .replace(/\s+/g, " ")
    .trim();

  // 2) Linked h2 inside page-header (common on event category articles)
  const linkedH2 = $("div.page-header h2 a, .item-page h2 a")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  // 3) Visible h1/h2 in item-page
  const pageH = $("div.item-page h1, div.item-page h2.article-title, .jsn-article-title")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const candidates = [docTitle, linkedH2, pageH].filter((t) => t && t.length > 2);
  for (const t of candidates) {
    if (!GENERIC_TITLE_RE.test(t)) return t;
  }

  // 4) Fallback: humanize URL slug
  return titleFromSlug(slugFromUrl(url));
}

function classify(url: string, title: string): {
  kind: ScrapedKind;
  pageSlug?: string;
  newsCategory?: ScrapedItem["newsCategory"];
  eventCategory?: ScrapedItem["eventCategory"];
  categoryHint: string | null;
} {
  if (SKIP_PATH_RE.test(url) || SKIP_TITLE_RE.test(title.trim())) {
    return { kind: "skip", categoryHint: "demo" };
  }

  const lower = `${url} ${title}`.toLowerCase();

  // Known static pages → Payload pages slugs
  if (/\/the-chamber\/our-mission(?:\/|$|\?)/i.test(url)) {
    return { kind: "page", pageSlug: "vision-mission", categoryHint: "about" };
  }
  if (/word-from-the-u-s-embassy|word from the u\.?s\.? embassy/i.test(lower)) {
    return { kind: "page", pageSlug: "word-from-the-us-embassy", categoryHint: "about" };
  }
  if (/2015-12-05-11-13-56|word from the president|mot du président/i.test(lower)) {
    return { kind: "page", pageSlug: "word-from-the-president", categoryHint: "about" };
  }
  if (/who-can-join|who can join/i.test(lower)) {
    return { kind: "page", pageSlug: "membership-benefits", categoryHint: "membership" };
  }
  // Homepage "Who are we ?" — only the bare index without article id
  if (
    (url === `${AC}/index.php` ||
      url === `${AC}/` ||
      /\/ac\/?$/.test(url) ||
      /\/ac\/index\.php\/?$/.test(url))
  ) {
    return { kind: "page", pageSlug: "who-we-are", categoryHint: "about" };
  }

  // Events
  if (
    /11-43-14|trade-mission|upcoming|past.event|gala|summit|otc|breakfast|workshop|seminar|networking/i.test(
      lower,
    ) ||
    /\/90-|id=90/i.test(url)
  ) {
    let eventCategory: ScrapedItem["eventCategory"] = "networking";
    if (/trade.?mission|otc/i.test(lower)) eventCategory = "trade-mission";
    else if (/gala/i.test(lower)) eventCategory = "gala";
    else if (/workshop|training|seminar|franchise/i.test(lower)) eventCategory = "training";
    else if (/summit|forum|conference/i.test(lower)) eventCategory = "conference";
    return { kind: "event", eventCategory, categoryHint: "events" };
  }

  // Press / newsletter articles
  if (/99-newsletter|press.?release|id=99|newsletter/i.test(lower)) {
    const newsCategory: ScrapedItem["newsCategory"] = /press.?release/i.test(lower)
      ? "press-release"
      : "news";
    return { kind: "news", newsCategory, categoryHint: "pressroom" };
  }

  // Membership spotlights → news
  if (/88-membership|patron|sponsor|id=88/i.test(lower)) {
    return { kind: "news", newsCategory: "news", categoryHint: "membership" };
  }

  // Chamber category leftovers that aren't mapped pages → news
  if (/the-chamber|id=87/i.test(lower)) {
    return { kind: "news", newsCategory: "news", categoryHint: "about" };
  }

  // Default: treat substantial article URLs as news
  if (/\/\d{2,}-[a-z0-9-]+/i.test(url) || /index\.php\/\d+-/.test(url)) {
    return { kind: "news", newsCategory: "news", categoryHint: "general" };
  }

  return { kind: "skip", categoryHint: "unknown" };
}

function extractArticleLinks(html: string, pageUrl: string): string[] {
  const $ = cheerio.load(html);
  const links = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = absUrl($(el).attr("href"));
    if (!href) return;
    if (!href.includes("amchamcam.org")) return;
    if (!href.includes("/ac/")) return;
    if (SKIP_PATH_RE.test(href)) return;
    // Skip pure category/menu shells without article slug
    if (/option=com_content&view=category/i.test(href) && !/\/\d+-/.test(href)) {
      // still useful as crawl seed — handled separately
      return;
    }
    // Article-like: has numeric id-slug or known chamber paths
    if (
      /\/\d{2,}-[a-z0-9][\w-]*/i.test(href) ||
      /\/the-chamber\//i.test(href) ||
      /who-can-join|our-mission|word-from/i.test(href) ||
      /\/99-newsletter\//i.test(href) ||
      /\/88-membership\//i.test(href)
    ) {
      // Normalize
      const clean = href.split("#")[0].split("&limit=")[0];
      links.add(clean);
    }
  });

  // Always include the page itself if it looks like an article view
  if (/item-page|articleBody|jsn-article/i.test(html)) {
    links.add(pageUrl.split("#")[0]);
  }

  return [...links];
}

function parseArticle(html: string, url: string): ScrapedItem | null {
  const $ = cheerio.load(html);

  // Prefer item-page content; fall back to component area
  const $item =
    $("div.item-page").first().length > 0
      ? $("div.item-page").first()
      : $("#content, .jsn-mainbody, main").first();

  const isHomeWhoWeAre =
    url === `${AC}/index.php` ||
    url === `${AC}/` ||
    /amchamcam\.org\/ac\/?$/i.test(url) ||
    /\/ac\/index\.php\/?$/i.test(url);

  const title = isHomeWhoWeAre ? "Who We Are" : pickTitle($, url);
  if (!title || title.length < 3) return null;
  if (!isHomeWhoWeAre && SKIP_TITLE_RE.test(title)) return null;

  // Remove chrome from clone
  const $body = $item.clone();
  $body.find("script, style, nav, .pager, .article-info, .jsn-article-toolbar, .icons, .btn-group").remove();

  // Cover image: first meaningful content image
  const imageUrls: string[] = [];
  $body.find("img").each((_, img) => {
    const src = absUrl($(img).attr("src"));
    if (!src) return;
    if (/aclogo|logosocial|sampledata\/succeed|spacer|icon/i.test(src)) return;
    imageUrls.push(src);
  });

  // Also check intro image outside cleaned body
  $("img[src*='/images/']").each((_, img) => {
    const src = absUrl($(img).attr("src"));
    if (!src) return;
    if (/aclogo|logosocial|sampledata\/succeed|banners\/board|spacer/i.test(src)) return;
    if (!imageUrls.includes(src)) imageUrls.push(src);
  });

  const coverImageUrl = imageUrls[0] || null;

  // Published date
  let publishedAt: string | null = null;
  const timeEl = $item.find("time[datetime]").attr("datetime");
  if (timeEl) {
    const d = new Date(timeEl);
    if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
  }
  if (!publishedAt) {
    const info = $item.find(".article-info, .published, .create").text();
    const m = info.match(/(\d{1,2}\s+\w+\s+\d{4}|\w+\s+\d{1,2},\s*\d{4}|\d{4}-\d{2}-\d{2})/);
    if (m) {
      const d = new Date(m[1]);
      if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString();
    }
  }

  // Body HTML: prefer article content containers
  let bodyHtml =
    $body.find(".article-content, .jsn-article-content, [itemprop='articleBody']").html() ||
    $body.find(".item-page > *:not(h1):not(h2.page-header)").parent().html() ||
    $body.html() ||
    "";

  // Strip leftover title heading duplicates
  bodyHtml = bodyHtml
    .replace(/<h[12][^>]*>\s*Who are we \?\s*<\/h[12]>/i, "")
    .replace(/<div[^>]*class="[^"]*article-info[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");

  const plainLen = cheerio.load(bodyHtml).text().replace(/\s+/g, " ").trim().length;
  if (plainLen < 40 && classify(url, title).kind !== "page") {
    // Too thin — likely a category shell
    return null;
  }

  const excerpt = cheerio
    .load(bodyHtml)
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);

  const meta = classify(url, title);
  if (meta.kind === "skip") {
    return {
      sourceUrl: url,
      kind: "skip",
      slug: slugFromUrl(url),
      title,
      publishedAt,
      excerpt,
      bodyHtml,
      coverImageUrl,
      imageUrls,
      categoryHint: meta.categoryHint,
    };
  }

  return {
    sourceUrl: url,
    kind: meta.kind,
    slug: meta.pageSlug || slugFromUrl(url),
    title,
    publishedAt,
    excerpt: excerpt + (excerpt.length >= 240 ? "…" : ""),
    bodyHtml,
    coverImageUrl,
    imageUrls: imageUrls.slice(0, 12),
    categoryHint: meta.categoryHint,
    eventCategory: meta.eventCategory,
    newsCategory: meta.newsCategory,
    pageSlug: meta.pageSlug,
  };
}

async function main() {
  console.log("🔍 Scraping amchamcam.org (public pages only)…");
  mkdirSync(OUT_DIR, { recursive: true });

  const toVisit = new Set<string>(SEED_URLS);
  const visited = new Set<string>();
  const articles = new Map<string, ScrapedItem>();

  // First pass: collect links from seed pages
  for (const seed of SEED_URLS) {
    console.log(`Seed ${seed}`);
    const html = await fetchHtml(seed);
    await sleep(400);
    if (!html) continue;
    visited.add(seed);

    for (const link of extractArticleLinks(html, seed)) {
      toVisit.add(link);
    }

    // If seed itself is an article page, parse it
    const item = parseArticle(html, seed);
    if (item && item.kind !== "skip") {
      articles.set(item.sourceUrl, item);
      console.log(`  ✓ [${item.kind}] ${item.title}`);
    }
  }

  // Second pass: visit discovered article URLs
  const queue = [...toVisit].filter((u) => !visited.has(u));
  console.log(`\n📄 Visiting ${queue.length} discovered URLs…`);

  for (const url of queue) {
    if (visited.has(url)) continue;
    if (SKIP_PATH_RE.test(url)) continue;
    visited.add(url);

    // Skip category listing URLs in article parse (already used for discovery)
    if (/view=category/i.test(url) && !/\/\d{2,}-[a-z]/i.test(url)) continue;

    console.log(`Fetch ${url}`);
    const html = await fetchHtml(url);
    await sleep(350);
    if (!html) continue;

    // Discover more links one hop deep
    for (const link of extractArticleLinks(html, url)) {
      if (!visited.has(link) && !SKIP_PATH_RE.test(link)) {
        // Only enqueue clear article URLs to avoid infinite crawl
        if (/\/\d{2,}-[a-z0-9-]+/i.test(link) || /the-chamber|who-can-join|our-mission|word-from/i.test(link)) {
          if (!queue.includes(link)) queue.push(link);
        }
      }
    }

    const item = parseArticle(html, url);
    if (!item) {
      console.log("  (no article body)");
      continue;
    }
    if (item.kind === "skip") {
      console.log(`  skip: ${item.title}`);
      continue;
    }

    // Dedupe by slug+kind
    const key = `${item.kind}:${item.slug}`;
    const existing = [...articles.values()].find((a) => `${a.kind}:${a.slug}` === key);
    if (existing) {
      // Keep longer body
      if (item.bodyHtml.length > existing.bodyHtml.length) {
        articles.delete(existing.sourceUrl);
        articles.set(item.sourceUrl, item);
      }
      continue;
    }

    articles.set(item.sourceUrl, item);
    console.log(`  ✓ [${item.kind}] ${item.title}`);
  }

  const items = [...articles.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));
  const summary = {
    scrapedAt: new Date().toISOString(),
    source: BASE,
    counts: {
      total: items.length,
      page: items.filter((i) => i.kind === "page").length,
      news: items.filter((i) => i.kind === "news").length,
      event: items.filter((i) => i.kind === "event").length,
    },
    items,
  };

  const outFile = path.join(OUT_DIR, "export.json");
  writeFileSync(outFile, JSON.stringify(summary, null, 2), "utf8");
  console.log(`\n✅ Wrote ${items.length} items → ${outFile}`);
  console.log(summary.counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
