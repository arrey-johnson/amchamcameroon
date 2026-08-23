/**
 * Assign the two event photos to empty / placeholder hero slides.
 * Usage: npx payload run src/scripts/fill-hero-slides.ts
 */
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const LOG = path.join(ROOT, "data/hero-fill-log.txt");
const lines: string[] = [];
const log = (msg: string) => {
  lines.push(msg);
  console.log(msg);
};

const FILES = [
  {
    file: path.join(ROOT, "data/hero-uploads/hero-speaker.png"),
    name: "hero-speaker.png",
    altEn: "AmCham Cameroon event — guest speaker addressing members",
    altFr: "Événement AmCham Cameroun — orateur s'adressant aux membres",
  },
  {
    file: path.join(ROOT, "data/hero-uploads/hero-group.png"),
    name: "hero-group.png",
    altEn: "AmCham Cameroon leadership and guests at an official gathering",
    altFr: "Direction AmCham Cameroun et invités lors d'une rencontre officielle",
  },
];

const payload = await getPayload({ config });

const slides = await payload.find({
  collection: "hero-slides",
  limit: 50,
  sort: "order",
  depth: 1,
  locale: "en",
});

log(`Found ${slides.docs.length} hero slide(s):`);
for (const s of slides.docs) {
  const img = typeof s.image === "object" && s.image ? s.image : null;
  const filename = img && "filename" in img ? String(img.filename) : String(s.image ?? "NONE");
  log(`  #${s.id} order=${s.order} active=${s.active} title="${s.title}" image=${filename}`);
}

const isPlaceholder = (s: (typeof slides.docs)[number]) => {
  if (!s.image) return true;
  if (typeof s.image !== "object") return false;
  const name = String(s.image.filename || "").toLowerCase();
  if (!name) return true;
  if (name.includes("hero-speaker") || name.includes("hero-group")) return false;
  // Seeded placeholders / generated banners
  return (
    name.startsWith("hero-") ||
    name.includes("placeholder") ||
    name.includes("amcham-cameroon")
  );
};

let targets = slides.docs.filter(isPlaceholder);

if (targets.length < 2) {
  targets = slides.docs
    .filter((s) => {
      if (typeof s.image !== "object" || !s.image) return true;
      const name = String(s.image.filename || "").toLowerCase();
      return !name.includes("hero-speaker") && !name.includes("hero-group");
    })
    .slice(-Math.max(2, FILES.length));
}
targets = targets.slice(0, FILES.length);

log(`\nWill update ${targets.length} existing slide(s); create ${Math.max(0, FILES.length - targets.length)} new.`);

for (let i = 0; i < FILES.length; i++) {
  const meta = FILES[i];
  const buffer = readFileSync(meta.file);
  const media = await payload.create({
    collection: "media",
    locale: "en",
    data: { alt: meta.altEn },
    file: {
      data: buffer,
      mimetype: "image/png",
      name: meta.name,
      size: buffer.length,
    },
  });
  await payload.update({
    collection: "media",
    id: media.id,
    locale: "fr",
    data: { alt: meta.altFr },
  });
  log(`Uploaded media #${media.id} (${meta.name})`);

  const target = targets[i];
  if (target) {
    await payload.update({
      collection: "hero-slides",
      id: target.id,
      data: { image: media.id as number },
    });
    log(`Assigned to hero slide #${target.id} "${target.title}"`);
  } else {
    const order =
      slides.docs.reduce((max, s) => Math.max(max, typeof s.order === "number" ? s.order : 0), -1) +
      1 +
      i;
    const created = await payload.create({
      collection: "hero-slides",
      locale: "en",
      data: {
        title:
          i === 0
            ? "Connecting business. Building opportunity."
            : "Your partner for U.S.–Cameroon trade",
        subtitle:
          i === 0
            ? "The American Chamber of Commerce in Cameroon — advocating for members since 1994."
            : "Network, advocacy and market access for companies doing business between the U.S. and Cameroon.",
        image: media.id as number,
        ctaLabel: i === 0 ? "Become a Member" : "Explore Events",
        ctaUrl: i === 0 ? "/membership/apply" : "/events",
        order,
        active: true,
      },
    });
    await payload.update({
      collection: "hero-slides",
      id: created.id,
      locale: "fr",
      data: {
        title:
          i === 0
            ? "Connecter les affaires. Créer des opportunités."
            : "Votre partenaire pour le commerce É.-U.–Cameroun",
        subtitle:
          i === 0
            ? "La Chambre de Commerce Américaine au Cameroun — au service des membres depuis 1994."
            : "Réseau, plaidoyer et accès au marché pour les entreprises entre les É.-U. et le Cameroun.",
        ctaLabel: i === 0 ? "Devenir membre" : "Voir les événements",
      },
    });
    log(`Created hero slide #${created.id}`);
  }
}

log("\nDone.");
writeFileSync(LOG, lines.join("\n"), "utf8");
