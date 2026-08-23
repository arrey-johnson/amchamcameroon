/**
 * Remove fabricated seed "upcoming" events that never had real dates.
 * Usage: npx payload run src/scripts/remove-fake-upcoming-events.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

const FAKE_UPCOMING_SLUGS = [
  "business-forum-2026",
  "trade-mission-houston-2026",
  "executive-breakfast-march",
  "customs-tax-workshop",
];

const payload = await getPayload({ config });

const now = new Date().toISOString();
const upcoming = await payload.find({
  collection: "events",
  where: { startAt: { greater_than_equal: now } },
  limit: 100,
  sort: "startAt",
  locale: "en",
  depth: 0,
});

console.log(`Upcoming events before cleanup (${upcoming.docs.length}):`);
for (const e of upcoming.docs) {
  console.log(`  #${e.id} ${e.slug} | ${e.startAt} | ${e.title}`);
}

let deleted = 0;
for (const slug of FAKE_UPCOMING_SLUGS) {
  const res = await payload.find({
    collection: "events",
    where: { slug: { equals: slug } },
    limit: 5,
    depth: 0,
  });
  for (const doc of res.docs) {
    await payload.delete({ collection: "events", id: doc.id });
    console.log(`deleted #${doc.id} ${slug}`);
    deleted++;
  }
}

// Also clear ticker items that advertise non-existent 2026 forum / Houston mission
const ticker = await payload.find({ collection: "ticker-items", limit: 50, locale: "en" });
for (const item of ticker.docs) {
  const text = (item.text || "").toLowerCase();
  if (
    text.includes("business forum 2026") ||
    text.includes("houston") ||
    text.includes("forum d'affaires amcham cameroun 2026")
  ) {
    await payload.delete({ collection: "ticker-items", id: item.id });
    console.log(`deleted ticker #${item.id}: ${item.text}`);
  }
}

const after = await payload.find({
  collection: "events",
  where: { startAt: { greater_than_equal: new Date().toISOString() } },
  limit: 100,
  sort: "startAt",
  locale: "en",
  depth: 0,
});

console.log(`\nDeleted ${deleted} fake upcoming event(s).`);
console.log(`Upcoming remaining: ${after.docs.length}`);
for (const e of after.docs) {
  console.log(`  #${e.id} ${e.slug} | ${e.startAt} | ${e.title}`);
}
