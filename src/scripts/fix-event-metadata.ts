/**
 * Correct dates, categories, venues, titles, and galleries for scraped AmCham events.
 * Evidence from old-site copy + public reports (WEN Gala, West Africa Summit, USAID summit).
 *
 * Usage: npx payload run src/scripts/fix-event-metadata.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

type Payload = Awaited<ReturnType<typeof getPayload>>;
type Cat = "conference" | "networking" | "trade-mission" | "training" | "gala";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

type Fix = {
  slug: string;
  title: string;
  startAt: string;
  endAt?: string;
  category: Cat;
  venue: string;
  galleryUrls?: string[];
  delete?: boolean;
};

/** Cameroon WAT = UTC+1 → store as ISO UTC. */
function at(y: number, m: number, d: number, hour = 10, min = 0): string {
  // hour is local WAT; convert to UTC by subtracting 1h
  return new Date(Date.UTC(y, m - 1, d, hour - 1, min, 0)).toISOString();
}

const FIXES: Fix[] = [
  {
    slug: "further-strengthening-our-buy-amcham-culture",
    title: "Members’ Networking Cocktail — “Further Strengthening our Buy AmCham Culture”",
    startAt: at(2024, 7, 11, 18, 0),
    category: "networking",
    venue: "Douala",
    galleryUrls: [
      "https://amchamcam.org/ac/images/mixer2024/mixer1.jpg",
      "https://amchamcam.org/ac/images/mixer2024/mixer2.jpg",
      "https://amchamcam.org/ac/images/mixer2024/mixer3.jpg",
      "https://amchamcam.org/ac/images/mixer2024/mixer4.jpg",
    ],
  },
  {
    // Empty announcement duplicate of the USDA luncheon write-up
    slug: "leveraging-cameroon-s-untapped-agribusiness-potentials",
    title: "Leveraging Cameroon’s Untapped Agribusiness Potentials",
    startAt: at(2024, 9, 6, 12, 0),
    category: "training",
    venue: "Le BoJ Restaurant, Douala",
    delete: true,
  },
  {
    slug: "amcham-usda-present-u-s-partnership-opportunities-in-agribusiness",
    title: "Leveraging Cameroon’s Untapped Agribusiness Potentials (USDA / AmCham Luncheon)",
    startAt: at(2024, 9, 6, 12, 0),
    category: "training",
    venue: "Le BoJ Restaurant, Douala",
    galleryUrls: [
      "https://amchamcam.org/ac/images/agribusinessluncheon/IMG_0536.jpg",
      "https://amchamcam.org/ac/images/agribusinessluncheon/IMG_0729.jpg",
      "https://amchamcam.org/ac/images/agribusinessluncheon/IMG_0563.jpg",
      "https://amchamcam.org/ac/images/agribusinessluncheon/IMG_0576.jpg",
      "https://amchamcam.org/ac/images/agribusinessluncheon/IMG_0672.jpg",
      "https://amchamcam.org/ac/images/agribusinessluncheon/IMG_0609.jpg",
    ],
  },
  {
    slug: "usaid-amcham-investment-summit",
    title: "USAID / AmCham Investment Summit",
    startAt: at(2024, 10, 16, 9, 0),
    endAt: at(2024, 10, 17, 17, 0),
    category: "conference",
    venue: "Yaoundé & Douala",
  },
  {
    // Thin listing page — ordered between USDA (Sept) and USAID (Oct) on old site by article id
    slug: "cameroon-s-macroeconomic-investment-opportunities-a-platform-for-strategic-partnerships-and-innovations",
    title: "Cameroon’s Macroeconomic Investment Opportunities",
    startAt: at(2024, 10, 3, 9, 0),
    category: "conference",
    venue: "Douala",
  },
  {
    slug: "emerging-technologies-the-future-of-finance-amcham-webinar-on-january-30-2025-at-4pm-by-leah-m-rackovsky-financial-expert",
    title: "Emerging Technologies & the Future of Finance (Webinar)",
    startAt: at(2025, 1, 30, 16, 0),
    category: "training",
    venue: "Online",
  },
  {
    // Finance-law briefings typically land early in the fiscal year; page sat with early-2025 upcoming items
    slug: "2025-finance-law-boosting-sme-investment-through-tax-reduction",
    title: "2025 Finance Law — Boosting SME Investment through Tax Reduction",
    startAt: at(2025, 2, 20, 10, 0),
    category: "training",
    venue: "Douala",
  },
  {
    slug: "women-empowerment-network-gala-2025-accelerating-action-for-gender-equality",
    title: "Women Empowerment Network Gala 2025 — Accelerating Action for Gender Equality",
    startAt: at(2025, 3, 20, 18, 0),
    category: "gala",
    venue: "Best Western Hotel Soaho, Douala",
  },
  {
    slug: "amcham-west-africa-business-summit",
    title: "AmCham West Africa Business Summit 2025",
    startAt: at(2025, 5, 14, 9, 0),
    category: "conference",
    venue: "Abidjan, Côte d’Ivoire",
  },
  {
    slug: "welcome-ambassador-peter-barlerin",
    title: "Welcome Ambassador Peter Barlerin — AmCham Annual Gala",
    startAt: at(2018, 1, 26, 19, 0),
    category: "gala",
    venue: "Douala",
    galleryUrls: [
      "https://amchamcam.org/ac/images/ambyde.JPG",
      "https://amchamcam.org/ac/images/article/mars2018/amb.JPG",
    ],
  },
];

async function downloadImage(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 200) return null;
  const lower = url.toLowerCase();
  const mimetype = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".webp")
      ? "image/webp"
      : lower.endsWith(".gif")
        ? "image/gif"
        : "image/jpeg";
  const name = url.split("/").pop()?.split("?")[0] || "event.jpg";
  return { buffer, mimetype, name };
}

async function uploadGallery(payload: Payload, urls: string[], alt: string) {
  const ids: number[] = [];
  for (const url of urls) {
    const file = await downloadImage(url);
    if (!file) {
      payload.logger.warn(`  gallery skip ${url}`);
      continue;
    }
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
    ids.push(doc.id as number);
  }
  return ids.map((image) => ({ image }));
}

const payload = await getPayload({ config });

for (const fix of FIXES) {
  const found = await payload.find({
    collection: "events",
    where: { slug: { equals: fix.slug } },
    limit: 1,
    depth: 0,
  });
  const doc = found.docs[0];
  if (!doc) {
    payload.logger.warn(`missing ${fix.slug}`);
    continue;
  }

  if (fix.delete) {
    await payload.delete({ collection: "events", id: doc.id });
    payload.logger.info(`deleted duplicate ${fix.slug}`);
    continue;
  }

  const gallery =
    fix.galleryUrls && fix.galleryUrls.length > 0
      ? await uploadGallery(payload, fix.galleryUrls, fix.title)
      : undefined;

  await payload.update({
    collection: "events",
    id: doc.id,
    locale: "en",
    data: {
      title: fix.title,
      startAt: fix.startAt,
      endAt: fix.endAt || null,
      category: fix.category,
      venue: fix.venue,
      ...(gallery ? { gallery } : {}),
      _status: "published",
    },
  });

  const past = new Date(fix.startAt) < new Date();
  payload.logger.info(
    `fixed ${fix.slug} → ${fix.startAt.slice(0, 10)} [${fix.category}] ${past ? "PAST" : "UPCOMING"}`,
  );
}

// Also clean the seed "Annual Gala 2025" which was dated mid-2026 (confusing with real 2025 events)
const seedGala = await payload.find({
  collection: "events",
  where: { slug: { equals: "annual-gala-2025" } },
  limit: 1,
});
if (seedGala.docs[0]) {
  await payload.update({
    collection: "events",
    id: seedGala.docs[0].id,
    locale: "en",
    data: {
      title: "AmCham Annual Gala 2025",
      startAt: at(2025, 7, 11, 19, 0),
      category: "gala",
      venue: "Douala",
      _status: "published",
    },
  });
  payload.logger.info("fixed seed annual-gala-2025 → 2025-07-11 PAST");
}

payload.logger.info("✅ Event metadata fixes complete");
