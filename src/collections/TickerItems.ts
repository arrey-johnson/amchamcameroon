import type { CollectionConfig } from "payload";
import { activeOrStaff, anyStaff, editors } from "@/access";

export const TickerItems: CollectionConfig = {
  slug: "ticker-items",
  labels: { singular: "Ticker Item", plural: "News Ticker" },
  admin: {
    group: "Homepage",
    useAsTitle: "text",
    defaultColumns: ["text", "order", "active"],
    description: "Headlines shown in the sliding news ticker bar.",
  },
  access: {
    read: activeOrStaff,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  defaultSort: "order",
  fields: [
    { name: "text", type: "text", required: true, localized: true },
    { name: "url", type: "text", admin: { description: "Optional link for this headline." } },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
    { name: "active", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};
