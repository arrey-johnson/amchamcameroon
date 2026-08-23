/**
 * List featured patrons/sponsors currently on the logo wall.
 * Usage: npx payload run src/scripts/list-featured-members.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

const payload = await getPayload({ config });
const res = await payload.find({
  collection: "members",
  where: {
    or: [
      { featured: { equals: true } },
      { category: { equals: "patron" } },
      { category: { equals: "sponsor" } },
    ],
  },
  sort: "order",
  limit: 100,
  depth: 1,
  locale: "en",
});

console.log(`Featured / patron / sponsor members: ${res.docs.length}`);
for (const m of res.docs) {
  const logo =
    typeof m.logo === "object" && m.logo
      ? `${m.logo.filename || "yes"} (${m.logo.url || "no-url"})`
      : m.logo
        ? `id:${m.logo}`
        : "NONE";
  console.log(
    `#${m.id} [${m.category}] ${m.name} | sector=${m.sector || "-"} | web=${m.website || "-"} | logo=${logo}`,
  );
}
