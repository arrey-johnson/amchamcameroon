import type { CollectionConfig } from "payload";
import { anyStaff, editors, publishedOrStaff } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  admin: {
    group: "Site",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status"],
    description:
      "Fixed website pages such as About, Mission, and membership benefits. Edit the text here — no technical changes needed.",
  },
  access: {
    read: publishedOrStaff,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    afterChange: [revalidateTags("pages")],
    afterDelete: [revalidateTags("pages")],
  },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "intro", type: "textarea", localized: true, admin: { description: "Lead paragraph under the page title." } },
    { name: "body", type: "richText", localized: true },
    { name: "coverImage", type: "upload", relationTo: "media" },
    {
      name: "seo",
      type: "group",
      fields: [
        { name: "metaTitle", type: "text", localized: true },
        { name: "metaDescription", type: "textarea", localized: true },
      ],
    },
  ],
};
