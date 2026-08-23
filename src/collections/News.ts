import type { CollectionConfig } from "payload";
import { anyStaff, editors, publishedOrStaff } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "News Article", plural: "News" },
  admin: {
    group: "Pressroom",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
  },
  access: {
    read: publishedOrStaff,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    afterChange: [revalidateTags("news")],
    afterDelete: [revalidateTags("news")],
  },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "news",
      options: [
        { label: "News", value: "news" },
        { label: "Press Release", value: "press-release" },
        { label: "Op-Ed", value: "op-ed" },
        { label: "Policy", value: "policy" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "excerpt", type: "textarea", localized: true },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", localized: true },
    { name: "author", type: "text", admin: { position: "sidebar" } },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar" },
    },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text" }],
      admin: { position: "sidebar" },
    },
  ],
};
