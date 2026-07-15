import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";

export const BoardMembers: CollectionConfig = {
  slug: "board-members",
  labels: { singular: "Leadership Profile", plural: "Leadership (Board & Executive)" },
  admin: {
    group: "About",
    useAsTitle: "name",
    defaultColumns: ["name", "role", "group", "order"],
  },
  access: {
    read: anyone,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true, localized: true, admin: { description: "e.g. President, Vice-President, Executive Director" } },
    { name: "company", type: "text" },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "bio", type: "textarea", localized: true },
    { name: "linkedin", type: "text" },
    {
      name: "group",
      type: "select",
      required: true,
      defaultValue: "board",
      options: [
        { label: "Board of Directors", value: "board" },
        { label: "Executive Office", value: "executive" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
