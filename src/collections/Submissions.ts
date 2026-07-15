import type { CollectionConfig } from "payload";
import { anyStaff, superAdmins } from "@/access";

export const Submissions: CollectionConfig = {
  slug: "submissions",
  admin: {
    group: "Inbox",
    useAsTitle: "email",
    defaultColumns: ["type", "name", "email", "createdAt", "status"],
    description: "Contact messages, membership applications and newsletter subscriptions.",
  },
  access: {
    // Created server-side via local API (overrideAccess); public API cannot write directly.
    create: () => false,
    read: anyStaff,
    update: anyStaff,
    delete: superAdmins,
  },
  defaultSort: "-createdAt",
  fields: [
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Contact Message", value: "contact" },
        { label: "Membership Application", value: "membership" },
        { label: "Newsletter Subscription", value: "subscribe" },
      ],
    },
    { name: "name", type: "text" },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "company", type: "text" },
    { name: "message", type: "textarea" },
    {
      name: "meta",
      type: "json",
      admin: { description: "Extra structured data (e.g. membership category, sector)." },
    },
    { name: "locale", type: "text", defaultValue: "en" },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "In Review", value: "in-review" },
        { label: "Handled", value: "handled" },
      ],
      admin: { position: "sidebar" },
    },
  ],
};
