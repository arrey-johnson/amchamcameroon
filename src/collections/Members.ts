import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const Members: CollectionConfig = {
  slug: "members",
  admin: {
    group: "Membership",
    useAsTitle: "name",
    defaultColumns: ["name", "category", "sector", "featured", "order"],
    description: "Member companies shown in the directory and homepage logo wall.",
  },
  access: {
    read: anyone,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    afterChange: [revalidateTags("members")],
    afterDelete: [revalidateTags("members")],
  },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        {
          name: "category",
          type: "select",
          required: true,
          defaultValue: "corporate",
          options: [
            { label: "Patron", value: "patron" },
            { label: "Sponsor", value: "sponsor" },
            { label: "Corporate", value: "corporate" },
            { label: "SME", value: "sme" },
            { label: "Individual", value: "individual" },
          ],
        },
        { name: "sector", type: "text", admin: { description: "e.g. Banking, Energy, Logistics" } },
      ],
    },
    { name: "website", type: "text" },
    { name: "description", type: "textarea", localized: true },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Show in the homepage logo wall." },
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
