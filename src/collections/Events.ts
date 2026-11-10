import type { CollectionConfig } from "payload";
import { anyStaff, editors, publishedOrStaff } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Event", plural: "Events" },
  admin: {
    group: "People",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "startAt", "venue", "_status"],
    description:
      "Conferences, networking, trainings, and other programs. Save a draft while preparing details, then Publish when the event should appear on the website.",
  },
  access: {
    read: publishedOrStaff,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    afterChange: [revalidateTags("events")],
    afterDelete: [revalidateTags("events")],
  },
  versions: { drafts: true },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: "Event name",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "Web address name",
      admin: {
        description:
          "Short name used in the event link (e.g. business-forum-2026). Use lowercase letters, numbers, and hyphens only.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Cover photo",
      admin: { description: "Main image shown on the events list and event page." },
    },
    {
      type: "row",
      fields: [
        {
          name: "startAt",
          type: "date",
          required: true,
          label: "Starts",
          admin: {
            date: { pickerAppearance: "dayAndTime" },
            description: "Date and time the event begins.",
          },
        },
        {
          name: "endAt",
          type: "date",
          label: "Ends",
          admin: {
            date: { pickerAppearance: "dayAndTime" },
            description: "Optional. Leave blank for a single-day or open-ended event.",
          },
        },
      ],
    },
    {
      name: "venue",
      type: "text",
      localized: true,
      label: "Venue / location",
      admin: { description: "e.g. Pullman Douala Rabingha Hotel, or Online via Zoom" },
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "networking",
      label: "Event type",
      options: [
        { label: "Conference", value: "conference" },
        { label: "Networking", value: "networking" },
        { label: "Trade Mission to the USA", value: "trade-mission" },
        { label: "Training / Workshop", value: "training" },
        { label: "Gala / Ceremony", value: "gala" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "description",
      type: "richText",
      localized: true,
      label: "Event details",
      admin: { description: "Full description: agenda highlights, who should attend, and practical information." },
    },
    {
      type: "row",
      fields: [
        {
          name: "priceMember",
          type: "text",
          localized: true,
          label: "Price for members",
          admin: { description: "e.g. Free / 25,000 FCFA" },
        },
        {
          name: "priceNonMember",
          type: "text",
          localized: true,
          label: "Price for non-members",
          admin: { description: "e.g. 50,000 FCFA" },
        },
      ],
    },
    {
      name: "registrationUrl",
      type: "text",
      label: "Registration link",
      admin: {
        description:
          "External signup link (e.g. Glue Up). Leave empty if people should contact AmCham instead.",
      },
    },
    {
      name: "gallery",
      type: "array",
      label: "Event photos",
      admin: {
        description: "Photos from the event (especially useful after it has taken place).",
      },
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true, label: "Photo" }],
    },
  ],
};
