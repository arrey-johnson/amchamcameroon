import type { CollectionConfig } from "payload";
import { anyStaff, editors, publishedOrStaff } from "@/access";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    group: "Events",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "startAt", "venue", "_status"],
  },
  access: {
    read: publishedOrStaff,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  versions: { drafts: true },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "coverImage", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        { name: "startAt", type: "date", required: true, admin: { date: { pickerAppearance: "dayAndTime" } } },
        { name: "endAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
    { name: "venue", type: "text", localized: true },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "networking",
      options: [
        { label: "Conference", value: "conference" },
        { label: "Networking", value: "networking" },
        { label: "Trade Mission to the USA", value: "trade-mission" },
        { label: "Training / Workshop", value: "training" },
        { label: "Gala / Ceremony", value: "gala" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "description", type: "richText", localized: true },
    {
      type: "row",
      fields: [
        { name: "priceMember", type: "text", localized: true, admin: { description: "e.g. Free / 25,000 FCFA" } },
        { name: "priceNonMember", type: "text", localized: true },
      ],
    },
    {
      name: "registrationUrl",
      type: "text",
      admin: { description: "External registration link (e.g. Glue Up). Leave empty to use the contact form." },
    },
    {
      name: "gallery",
      type: "array",
      admin: { description: "Photos from the event (shown on past events)." },
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
  ],
};
