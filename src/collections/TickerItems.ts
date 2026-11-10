import type { CollectionConfig } from "payload";
import { activeOrStaff, anyStaff, editors } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const TickerItems: CollectionConfig = {
  slug: "ticker-items",
  labels: { singular: "Headline", plural: "Headlines" },
  admin: {
    group: "Homepage",
    useAsTitle: "text",
    defaultColumns: ["text", "order", "active"],
    description:
      "Short headlines that scroll under the homepage banner. Keep each line brief so it is easy to read.",
  },
  access: {
    read: activeOrStaff,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    afterChange: [revalidateTags("ticker-items")],
    afterDelete: [revalidateTags("ticker-items")],
  },
  defaultSort: "order",
  fields: [
    {
      name: "text",
      type: "text",
      required: true,
      localized: true,
      label: "Headline text",
      admin: { description: "Keep it short — one line that scrolls under the homepage banner." },
    },
    {
      name: "url",
      type: "text",
      label: "Optional link",
      admin: { description: "Where this headline goes when clicked. Leave empty for text only." },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "Display order",
      admin: { position: "sidebar", description: "Lower numbers appear first." },
    },
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      label: "Show on website",
      admin: { position: "sidebar", description: "Turn off to hide this headline without deleting it." },
    },
  ],
};
