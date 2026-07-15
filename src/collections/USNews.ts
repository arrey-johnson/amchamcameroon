import type { CollectionConfig } from "payload";
import { anyStaff, editors } from "@/access";

export const USNews: CollectionConfig = {
  slug: "us-news",
  labels: { singular: "U.S. News Item", plural: "U.S. Business News" },
  admin: {
    group: "Pressroom",
    useAsTitle: "title",
    defaultColumns: ["title", "source", "publishedAt", "approved"],
    description: "Curated U.S. trade & business headlines shown on the homepage.",
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return { approved: { equals: true } };
    },
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  defaultSort: "-publishedAt",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      type: "row",
      fields: [
        { name: "source", type: "text", required: true, admin: { description: "e.g. U.S. Chamber of Commerce, Reuters" } },
        { name: "publishedAt", type: "date", required: true, defaultValue: () => new Date().toISOString() },
      ],
    },
    { name: "url", type: "text", required: true },
    { name: "summary", type: "textarea", localized: true },
    { name: "approved", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
