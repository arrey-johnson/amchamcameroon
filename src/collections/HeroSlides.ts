import type { CollectionConfig } from "payload";
import { activeOrStaff, anyStaff, editors } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const HeroSlides: CollectionConfig = {
  slug: "hero-slides",
  labels: { singular: "Hero Slide", plural: "Hero Slides" },
  admin: {
    group: "Homepage",
    useAsTitle: "title",
    defaultColumns: ["title", "order", "active"],
    description: "Full-width homepage banner slides. Drag order via the Order field.",
  },
  access: {
    read: activeOrStaff,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    afterChange: [revalidateTags("hero-slides")],
    afterDelete: [revalidateTags("hero-slides")],
  },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "subtitle", type: "textarea", localized: true },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "Recommended: 1920×1080 or larger landscape. Faces should sit in the upper half of the photo — the site crops from the top so heads stay visible on desktop.",
      },
    },
    {
      type: "row",
      fields: [
        { name: "ctaLabel", type: "text", localized: true },
        { name: "ctaUrl", type: "text" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "startDate", type: "date", admin: { description: "Optional — show from this date." } },
        { name: "endDate", type: "date", admin: { description: "Optional — hide after this date." } },
      ],
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
    { name: "active", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
