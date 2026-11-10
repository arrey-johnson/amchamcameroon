import type { CollectionConfig } from "payload";
import { activeOrStaff, anyStaff, editors } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const HeroSlides: CollectionConfig = {
  slug: "hero-slides",
  labels: { singular: "Banner", plural: "Banners" },
  admin: {
    group: "Homepage",
    useAsTitle: "title",
    defaultColumns: ["title", "order", "active"],
    description:
      "Large photos and headlines at the top of the homepage. Lower Order numbers appear first. Turn Active off to hide a banner without deleting it.",
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
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: "Headline",
      admin: { description: "Main text overlaid on the banner photo." },
    },
    {
      name: "subtitle",
      type: "textarea",
      localized: true,
      label: "Supporting line",
      admin: { description: "Optional shorter sentence under the headline." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Banner photo",
      admin: {
        description:
          "Recommended: 1920×1080 or larger landscape. Keep faces in the upper half of the photo so heads stay visible on desktop.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "ctaLabel",
          type: "text",
          localized: true,
          label: "Button text",
          admin: { description: "e.g. Become a member, View events" },
        },
        {
          name: "ctaUrl",
          type: "text",
          label: "Button link",
          admin: { description: "Where the button goes, e.g. /en/membership or a full URL." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "startDate",
          type: "date",
          label: "Show from",
          admin: { description: "Optional — start showing this banner on this date." },
        },
        {
          name: "endDate",
          type: "date",
          label: "Hide after",
          admin: { description: "Optional — stop showing this banner after this date." },
        },
      ],
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "Display order",
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first in the slideshow.",
      },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      label: "Show on website",
      admin: {
        position: "sidebar",
        description: "Turn off to hide this banner without deleting it.",
      },
    },
  ],
};
