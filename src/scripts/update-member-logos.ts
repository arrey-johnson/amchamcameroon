/**
 * Convert downloaded brand assets → PNG, generate wordmarks for missing locals,
 * then upload into Payload members (patrons/sponsors logo wall).
 *
 * Usage: npx payload run src/scripts/update-member-logos.ts
 */
import path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { getPayload } from "payload";
import config from "@payload-config";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "data/member-logos");
const OUT = path.join(ROOT, "data/member-logos/ready");
mkdirSync(OUT, { recursive: true });

type Spec = {
  memberName: string;
  file?: string; // existing download basename
  website?: string;
  wordmark?: { text: string; bg: string; fg: string };
};

/** Map CMS member names → downloaded files / official sites / wordmark fallbacks. */
const SPECS: Spec[] = [
  {
    memberName: "Standard Chartered Bank",
    file: "standard-chartered.png",
    website: "https://www.sc.com",
  },
  { memberName: "MTN Cameroon", file: "mtn.png", website: "https://www.mtn.cm" },
  {
    memberName: "Colgate-Palmolive",
    file: "colgate.png",
    website: "https://www.colgatepalmolive.com",
  },
  { memberName: "Citi", file: "citi.svg", website: "https://www.citi.com" },
  { memberName: "PwC", file: "pwc.svg", website: "https://www.pwc.com" },
  { memberName: "Ecobank", file: "ecobank.png", website: "https://www.ecobank.com" },
  { memberName: "SGS", file: "sgs.png", website: "https://www.sgs.com" },
  {
    memberName: "Conseils Fiscaux Associés",
    website: "https://amchamcam.org",
    wordmark: { text: "CFA", bg: "#0B1F3A", fg: "#FFFFFF" },
  },
  { memberName: "COTCO", file: "cotco.png", website: "https://www.cotco.cm" },
  {
    memberName: "Société Générale Cameroun",
    website: "https://www.societegenerale.cm",
    wordmark: { text: "SG", bg: "#E60028", fg: "#FFFFFF" },
  },
  {
    memberName: "Noble Energy",
    website: "https://www.chevron.com",
    wordmark: { text: "NOBLE", bg: "#003366", fg: "#F5C518" },
  },
  { memberName: "Olam", file: "olam.png", website: "https://www.olamgroup.com" },
  {
    memberName: "Prudential Beneficial",
    file: "prudential.png",
    website: "https://www.prudential.com",
    wordmark: { text: "PRU", bg: "#0033A0", fg: "#FFFFFF" },
  },
  { memberName: "Deloitte", file: "deloitte.png", website: "https://www.deloitte.com" },
  {
    memberName: "UBA (United Bank for Africa)",
    file: "uba.png",
    website: "https://www.ubagroup.com",
  },
  {
    memberName: "Tropix Group SARL",
    website: "https://amchamcam.org",
    wordmark: { text: "TROPIX", bg: "#0E7C66", fg: "#FFFFFF" },
  },
  {
    memberName: "NFC Bank",
    file: "nfc.png",
    website: "https://www.nfcbank.com",
    wordmark: { text: "NFC", bg: "#0B5CAB", fg: "#FFFFFF" },
  },
  {
    memberName: "ELTA Travel",
    file: "elta.png",
    website: "https://www.eltatravel.com",
    wordmark: { text: "ELTA", bg: "#C8102E", fg: "#FFFFFF" },
  },
  {
    memberName: "Les Hôtels Séréna",
    website: "https://amchamcam.org",
    wordmark: { text: "SÉRÉNA", bg: "#7A1F2B", fg: "#F5E6C8" },
  },
  {
    memberName: "Nya & Co. Law Firm",
    file: "nya.png",
    website: "https://www.nyaandco.com",
    wordmark: { text: "NYA", bg: "#1A2744", fg: "#FFFFFF" },
  },
  {
    memberName: "The Abeng Law Firm",
    website: "https://amchamcam.org",
    wordmark: { text: "ABENG", bg: "#1A2744", fg: "#D4AF37" },
  },
  {
    memberName: "American School of Douala",
    website: "https://www.asdouala.com",
    wordmark: { text: "ASD", bg: "#002868", fg: "#FFFFFF" },
  },
  {
    memberName: "InfoPro Solution (IPS)",
    file: "ips.png",
    website: "https://www.infoprosolution.com",
    wordmark: { text: "IPS", bg: "#111827", fg: "#38BDF8" },
  },
  {
    memberName: "Carrières du Moungo",
    file: "carrieres.png",
    website: "https://www.cdm.cm",
    wordmark: { text: "CDM", bg: "#92400E", fg: "#FFFFFF" },
  },
];

async function wordmarkPng(text: string, bg: string, fg: string, outPath: string) {
  const w = 480;
  const h = 240;
  const fontSize = text.length > 6 ? 48 : text.length > 4 ? 64 : 84;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bg}" rx="16"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${fontSize}" fill="${fg}">${text}</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function toReadyPng(spec: Spec): Promise<string> {
  const outPath = path.join(OUT, `${slugify(spec.memberName)}.png`);

  const makeWordmark = async () => {
    const wm = spec.wordmark ?? {
      text: spec.memberName
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "AC",
      bg: "#0B1F3A",
      fg: "#FFFFFF",
    };
    await wordmarkPng(wm.text, wm.bg, wm.fg, outPath);
  };

  if (spec.file) {
    const src = path.join(SRC, spec.file);
    if (!existsSync(src)) {
      console.log(`  missing ${spec.file}, using wordmark`);
      await makeWordmark();
      return outPath;
    }
    try {
      const buf = readFileSync(src);
      await sharp(buf)
        .resize({ width: 400, height: 200, fit: "inside", withoutEnlargement: false })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .png()
        .toFile(outPath);
      return outPath;
    } catch (err) {
      console.log(`  bad image ${spec.file} (${(err as Error).message}), using wordmark`);
      await makeWordmark();
      return outPath;
    }
  }

  await makeWordmark();
  return outPath;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const payload = await getPayload({ config });
const members = await payload.find({
  collection: "members",
  limit: 200,
  depth: 0,
  locale: "en",
});

let updated = 0;
let skipped = 0;

for (const spec of SPECS) {
  const member = members.docs.find((m) => m.name === spec.memberName);
  if (!member) {
    console.log(`SKIP (not in CMS): ${spec.memberName}`);
    skipped++;
    continue;
  }

  const pngPath = await toReadyPng(spec);
  const buffer = readFileSync(pngPath);
  const media = await payload.create({
    collection: "media",
    locale: "en",
    data: { alt: `${spec.memberName} logo` },
    file: {
      data: buffer,
      mimetype: "image/png",
      name: `logo-${slugify(spec.memberName)}.png`,
      size: buffer.length,
    },
  });
  await payload.update({
    collection: "media",
    id: media.id,
    locale: "fr",
    data: { alt: `Logo ${spec.memberName}` },
  });

  await payload.update({
    collection: "members",
    id: member.id,
    data: {
      logo: media.id as number,
      ...(spec.website ? { website: spec.website } : {}),
      featured: true,
    },
  });

  const source = spec.file ? `file:${spec.file}` : `wordmark:${spec.wordmark?.text}`;
  console.log(`OK #${member.id} ${spec.memberName} ← ${source} (media #${media.id})`);
  updated++;
}

writeFileSync(
  path.join(SRC, "update-log.txt"),
  `updated=${updated} skipped=${skipped} at=${new Date().toISOString()}\n`,
);
console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`);
