import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "File", plural: "Media" },
  admin: {
    group: "Site",
    description:
      "Images, logos, and PDFs used across the website. Upload here, then attach the file when editing a page, news article, or member.",
  },
  access: {
    read: anyone,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "application/pdf", "video/mp4", "video/webm"],
    imageSizes: [
      { name: "thumbnail", width: 480 },
      { name: "card", width: 900 },
      { name: "hero", width: 1920 },
    ],
    adminThumbnail: "thumbnail",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      admin: { description: "Alternative text for accessibility & SEO." },
    },
  ],
};
