/**
 * Quick count check after Joomla import.
 * Usage: npx payload run src/scripts/verify-joomla-import.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });

for (const collection of ["pages", "news", "events"] as const) {
  const res = await payload.find({ collection, limit: 1, depth: 0 });
  payload.logger.info(`${collection}: ${res.totalDocs}`);
}

const sampleNews = await payload.find({ collection: "news", limit: 3, sort: "-publishedAt" });
for (const n of sampleNews.docs) {
  payload.logger.info(`  news: ${n.slug} — ${n.title}`);
}
const sampleEvents = await payload.find({ collection: "events", limit: 3, sort: "-startAt" });
for (const e of sampleEvents.docs) {
  payload.logger.info(`  event: ${e.slug} — ${e.title}`);
}
