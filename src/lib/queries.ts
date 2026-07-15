import { getPayloadClient, type AppLocale } from "@/lib/payload";
import type {
  BoardMember,
  Committee,
  Event,
  GalleryAlbum,
  HeroSlide,
  Member,
  News,
  Newsletter,
  Page,
  Setting,
  TickerItem,
  UsNew,
} from "@/payload-types";

export async function getSettings(locale: AppLocale): Promise<Setting> {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "settings", locale });
}

export async function getTickerItems(locale: AppLocale): Promise<TickerItem[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "ticker-items",
    where: { active: { equals: true } },
    sort: "order",
    locale,
    limit: 20,
  });
  return res.docs;
}

export async function getHeroSlides(locale: AppLocale): Promise<HeroSlide[]> {
  const payload = await getPayloadClient();
  const now = new Date().toISOString();
  const res = await payload.find({
    collection: "hero-slides",
    where: {
      and: [
        { active: { equals: true } },
        { or: [{ startDate: { exists: false } }, { startDate: { less_than_equal: now } }] },
        { or: [{ endDate: { exists: false } }, { endDate: { greater_than_equal: now } }] },
      ],
    },
    sort: "order",
    locale,
    limit: 8,
  });
  return res.docs;
}

export async function getUpcomingEvents(locale: AppLocale, limit = 3): Promise<Event[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "events",
    where: { startAt: { greater_than_equal: new Date().toISOString() } },
    sort: "startAt",
    locale,
    limit,
  });
  return res.docs;
}

export async function getPastEvents(locale: AppLocale, limit = 12): Promise<Event[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "events",
    where: { startAt: { less_than: new Date().toISOString() } },
    sort: "-startAt",
    locale,
    limit,
  });
  return res.docs;
}

export async function getLatestNews(
  locale: AppLocale,
  limit = 6,
  category?: string,
): Promise<News[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "news",
    where: category ? { category: { equals: category } } : {},
    sort: "-publishedAt",
    locale,
    limit,
  });
  return res.docs;
}

export async function getUSNews(locale: AppLocale, limit = 4): Promise<UsNew[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "us-news",
    where: { approved: { equals: true } },
    sort: "-publishedAt",
    locale,
    limit,
  });
  return res.docs;
}

export async function getFeaturedMembers(locale: AppLocale): Promise<Member[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "members",
    where: { featured: { equals: true } },
    sort: "order",
    locale,
    limit: 30,
  });
  return res.docs;
}

export async function getAllMembers(locale: AppLocale): Promise<Member[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "members",
    sort: "order",
    locale,
    limit: 300,
  });
  return res.docs;
}

export async function getBoard(
  locale: AppLocale,
  group: "board" | "executive",
): Promise<BoardMember[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "board-members",
    where: { group: { equals: group } },
    sort: "order",
    locale,
    limit: 50,
  });
  return res.docs;
}

export async function getCommittees(locale: AppLocale): Promise<Committee[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "committees",
    sort: "order",
    locale,
    limit: 50,
  });
  return res.docs;
}

export async function getCommittee(locale: AppLocale, slug: string): Promise<Committee | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "committees",
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
  });
  return res.docs[0] ?? null;
}

export async function getNewsletters(locale: AppLocale): Promise<Newsletter[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "newsletters",
    sort: "-date",
    locale,
    limit: 100,
  });
  return res.docs;
}

export async function getPage(locale: AppLocale, slug: string): Promise<Page | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
  });
  return res.docs[0] ?? null;
}

export async function getNewsArticle(locale: AppLocale, slug: string): Promise<News | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "news",
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
  });
  return res.docs[0] ?? null;
}

export async function searchContent(
  locale: AppLocale,
  query: string,
): Promise<{ news: News[]; events: Event[]; members: Member[] }> {
  const payload = await getPayloadClient();
  const [news, events, members] = await Promise.all([
    payload.find({
      collection: "news",
      where: { or: [{ title: { like: query } }, { excerpt: { like: query } }] },
      locale,
      limit: 10,
    }),
    payload.find({
      collection: "events",
      where: { or: [{ title: { like: query } }, { venue: { like: query } }] },
      locale,
      limit: 10,
    }),
    payload.find({
      collection: "members",
      where: { or: [{ name: { like: query } }, { sector: { like: query } }] },
      locale,
      limit: 10,
    }),
  ]);
  return { news: news.docs, events: events.docs, members: members.docs };
}

export async function getGalleryAlbums(locale: AppLocale): Promise<GalleryAlbum[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "gallery-albums",
    sort: "-date",
    locale,
    limit: 50,
  });
  return res.docs;
}

export async function getEvent(locale: AppLocale, slug: string): Promise<Event | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "events",
    where: { slug: { equals: slug } },
    locale,
    limit: 1,
  });
  return res.docs[0] ?? null;
}
