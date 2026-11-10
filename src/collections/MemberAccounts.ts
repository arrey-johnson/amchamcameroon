import type { CollectionConfig } from "payload";
import { anyStaff, editors } from "@/access";

/**
 * Separate auth collection for the public member portal.
 * Kept distinct from `users` so members never get CMS /admin access.
 */
export const MemberAccounts: CollectionConfig = {
  slug: "member-accounts",
  auth: true,
  labels: { singular: "Member account", plural: "Member accounts" },
  admin: {
    group: "People",
    useAsTitle: "email",
    defaultColumns: ["email", "name", "status", "member", "updatedAt"],
    description:
      "Login accounts for the member portal. Create an account here, link it to a Member company, and share the email/password with the contact.",
  },
  access: {
    admin: anyStaff,
    create: anyStaff,
    delete: editors,
    read: ({ req }) => {
      if (anyStaff({ req })) return true;
      if (req.user?.collection === "member-accounts") {
        return { id: { equals: req.user.id } };
      }
      return false;
    },
    update: ({ req }) => {
      if (anyStaff({ req })) return true;
      if (req.user?.collection === "member-accounts") {
        return { id: { equals: req.user.id } };
      }
      return false;
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Contact name",
      admin: { description: "Person who will use this portal login." },
    },
    {
      name: "phone",
      type: "text",
      label: "Phone",
    },
    {
      name: "member",
      type: "relationship",
      relationTo: "members",
      required: true,
      label: "Member company",
      admin: {
        description: "Company this login represents in the directory.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      label: "Account status",
      options: [
        { label: "Active — can sign in", value: "active" },
        { label: "Invited — not yet active", value: "invited" },
        { label: "Disabled", value: "disabled" },
      ],
      access: {
        update: ({ req }) => Boolean(anyStaff({ req })),
      },
      admin: {
        position: "sidebar",
        description: "Only Active accounts can sign in to the portal.",
      },
    },
  ],
};
