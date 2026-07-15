import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Content",
    description: "Reusable media library: images, logos, PDFs.",
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
