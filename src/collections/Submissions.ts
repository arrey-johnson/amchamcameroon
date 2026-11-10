import type { CollectionConfig } from "payload";
import { anyStaff, superAdmins } from "@/access";

export const Submissions: CollectionConfig = {
  slug: "submissions",
  labels: { singular: "Message", plural: "Inbox" },
  admin: {
    group: "Messages",
    useAsTitle: "email",
    defaultColumns: ["type", "name", "email", "createdAt", "status"],
    description:
      "Everything submitted from the public website: contact forms, membership applications, and newsletter signups. Mark items Done after you have handled them.",
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
      label: "Message type",
      options: [
        { label: "Contact message", value: "contact" },
        { label: "Membership application", value: "membership" },
        { label: "Newsletter subscription", value: "subscribe" },
      ],
    },
    { name: "name", type: "text", label: "Name" },
    { name: "email", type: "email", required: true, label: "Email" },
    { name: "phone", type: "text", label: "Phone" },
    { name: "company", type: "text", label: "Company" },
    { name: "message", type: "textarea", label: "Message" },
    {
      name: "meta",
      type: "json",
      label: "Extra details",
      admin: {
        description: "Extra information from the form (e.g. membership category or sector), if any.",
      },
    },
    {
      name: "locale",
      type: "text",
      defaultValue: "en",
      label: "Form language",
      admin: { description: "Language the visitor used on the website (en or fr)." },
    },
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      label: "Follow-up status",
      options: [
        { label: "New — not reviewed yet", value: "new" },
        { label: "In review — being handled", value: "in-review" },
        { label: "Done — handled", value: "handled" },
      ],
      admin: {
        position: "sidebar",
        description: "Update this as you work the inbox so the team knows what still needs attention.",
      },
    },
  ],
};
