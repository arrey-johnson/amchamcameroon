import { getPayload } from "payload";
import config from "@payload-config";

const slug = process.argv[2] || "xaf-500-billion-saved-in-five-years";
const payload = await getPayload({ config });
const res = await payload.find({
  collection: "news",
  where: { slug: { equals: slug } },
  limit: 1,
  locale: "en",
});
const doc = res.docs[0];
if (!doc) {
  payload.logger.error(`Not found: ${slug}`);
  process.exit(1);
}
payload.logger.info(`TITLE: ${doc.title}`);
payload.logger.info(`EXCERPT: ${String(doc.excerpt || "").slice(0, 300)}`);
const children = (doc.body as { root?: { children?: unknown[] } })?.root?.children || [];
payload.logger.info(`BLOCKS: ${children.length}`);
for (const [i, block] of children.slice(0, 8).entries()) {
  payload.logger.info(`--- block ${i} ---`);
  payload.logger.info(JSON.stringify(block).slice(0, 800));
}
