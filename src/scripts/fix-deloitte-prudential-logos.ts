/**
 * Fix Deloitte + Prudential logos (ICO downloads failed as PNG).
 * Usage: npx payload run src/scripts/fix-deloitte-prudential-logos.ts
 */
import path from "path";
import { readFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { getPayload } from "payload";
import config from "@payload-config";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../data/member-logos/ready");
mkdirSync(OUT, { recursive: true });

async function wordmark(text: string, bg: string, fg: string, file: string) {
  const w = 520;
  const h = 220;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bg}" rx="12"/>
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
    font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="64" fill="${fg}">${text}</text>
</svg>`;
  const out = path.join(OUT, file);
  await sharp(Buffer.from(svg)).png().toFile(out);
  return out;
}

const payload = await getPayload({ config });

const fixes = [
  { name: "Deloitte", file: await wordmark("Deloitte", "#000000", "#86BC25", "deloitte-wm.png") },
  {
    name: "Prudential Beneficial",
    file: await wordmark("Prudential", "#0033A0", "#FFFFFF", "prudential-wm.png"),
  },
];

for (const fix of fixes) {
  const found = await payload.find({
    collection: "members",
    where: { name: { equals: fix.name } },
    limit: 1,
  });
  const member = found.docs[0];
  if (!member) {
    console.log(`missing member ${fix.name}`);
    continue;
  }
  const buffer = readFileSync(fix.file);
  const media = await payload.create({
    collection: "media",
    locale: "en",
    data: { alt: `${fix.name} logo` },
    file: {
      data: buffer,
      mimetype: "image/png",
      name: path.basename(fix.file),
      size: buffer.length,
    },
  });
  await payload.update({
    collection: "members",
    id: member.id,
    data: { logo: media.id as number, featured: true },
  });
  console.log(`fixed ${fix.name} → media #${media.id}`);
}
