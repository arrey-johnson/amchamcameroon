import { getPayloadClient } from "@/lib/payload";

type SlugCollection = "news" | "events" | "pages" | "committees";

const HAS_DRAFTS: Record<SlugCollection, boolean> = {
  news: true,
  events: true,
  pages: true,
  committees: false,
};

/**
 * Slugs to prerender at build time. Returns [] if the database is unreachable
 * so the build still succeeds; those pages then render on first request.
 */
export async function slugParams(collection: SlugCollection): Promise<{ slug: string }[]> {
  try {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection,
      where: HAS_DRAFTS[collection] ? { _status: { equals: "published" } } : {},
      limit: 500,
      depth: 0,
      pagination: false,
    });
    return res.docs
      .map((doc) => (doc as { slug?: string | null }).slug)
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
  } catch {
    return [];
  }
}
