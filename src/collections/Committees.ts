import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";

export const Committees: CollectionConfig = {
  slug: "committees",
  admin: {
    group: "About",
    useAsTitle: "name",
    defaultColumns: ["name", "chair", "order"],
    description: "Working committees — add as many as needed.",
  },
  access: {
    read: anyone,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "summary", type: "textarea", localized: true },
    { name: "description", type: "richText", localized: true },
    {
      name: "focusAreas",
      type: "array",
      fields: [{ name: "area", type: "text", localized: true }],
    },
    { name: "chair", type: "text", admin: { description: "Committee chairperson" } },
    { name: "coverImage", type: "upload", relationTo: "media" },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
