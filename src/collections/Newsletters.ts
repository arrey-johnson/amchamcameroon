import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const Newsletters: CollectionConfig = {
  slug: "newsletters",
  labels: { singular: "Newsletter", plural: "Newsletters" },
  admin: {
    group: "News & media",
    useAsTitle: "title",
    defaultColumns: ["title", "issueNumber", "date"],
    description:
      "Past newsletter issues visitors can download. Upload the PDF and an optional cover image.",
  },
  access: {
    read: anyone,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    afterChange: [revalidateTags("newsletters")],
    afterDelete: [revalidateTags("newsletters")],
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
