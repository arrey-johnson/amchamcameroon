import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";

export const Newsletters: CollectionConfig = {
  slug: "newsletters",
  admin: {
    group: "Pressroom",
    useAsTitle: "title",
    defaultColumns: ["title", "issueNumber", "date"],
    description: "Newsletter archive — upload the PDF and a cover image.",
  },
  access: {
    read: anyone,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  defaultSort: "-date",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      type: "row",
      fields: [
        { name: "issueNumber", type: "text" },
        { name: "date", type: "date", required: true },
      ],
    },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "pdf", type: "upload", relationTo: "media", required: true, admin: { description: "The downloadable PDF issue." } },
  ],
};
