/**
 * Re-convert scraped HTML → Lexical with the fixed converter and update Payload docs.
 * Usage: npx payload run src/scripts/reimport-joomla-bodies.ts
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";
import { htmlToLexical, htmlToExcerpt } from "./htmlToLexical";
import type { ScrapedItem } from "./scrape-joomla";

type ExportFile = { items: ScrapedItem[] };

const EXPORT_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/joomla-export/export.json",
);

const payload = await getPayload({ config });

if (!existsSync(EXPORT_FILE)) {
  payload.logger.error(`Missing ${EXPORT_FILE}`);
  process.exit(1);
}

const exported = JSON.parse(readFileSync(EXPORT_FILE, "utf8")) as ExportFile;
let updated = 0;
let failed = 0;

for (const item of exported.items) {
  if (!item.bodyHtml || item.kind === "skip") continue;
  const collection =
    item.kind === "page" ? "pages" : item.kind === "event" ? "events" : "news";
  const slug = item.pageSlug || item.slug;

  try {
    const existing = await payload.find({
      collection,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });
    const doc = existing.docs[0];
    if (!doc) {
      payload.logger.warn(`skip missing ${collection}/${slug}`);
      continue;
    }

    const body = htmlToLexical(item.bodyHtml);
    const excerpt = item.excerpt || htmlToExcerpt(item.bodyHtml);

    if (collection === "news") {
      await payload.update({
        collection: "news",
        id: doc.id,
        locale: "en",
        data: { body, excerpt },
      });
    } else if (collection === "events") {
      await payload.update({
        collection: "events",
        id: doc.id,
        locale: "en",
        data: { description: body },
      });
    } else {
      await payload.update({
        collection: "pages",
        id: doc.id,
        locale: "en",
        data: {
          body,
          intro: excerpt.slice(0, 200),
        },
      });
    }

    updated++;
    payload.logger.info(`fixed ${collection}/${slug}`);
  } catch (e) {
    failed++;
    payload.logger.error(`FAIL ${collection}/${slug}: ${e}`);
  }
}

payload.logger.info(`✅ Reimport bodies done — updated=${updated} failed=${failed}`);
