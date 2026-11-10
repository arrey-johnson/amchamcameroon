import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const Members: CollectionConfig = {
  slug: "members",
  labels: { singular: "Member", plural: "Members" },
  admin: {
    group: "People",
    useAsTitle: "name",
    defaultColumns: ["name", "category", "membershipStatus", "sector", "featured", "order"],
    description:
      "Member companies listed in the directory. Turn on Featured to also show their logo on the homepage. Create a Member account (People → Member accounts) so they can use the portal.",
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
    {
      name: "name",
      type: "text",
      required: true,
      label: "Company name",
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      label: "Company logo",
      admin: {
        description: "Prefer a clear logo on a transparent or white background for the directory and logo wall.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "category",
          type: "select",
          required: true,
          defaultValue: "corporate",
          label: "Membership category",
          options: [
            { label: "Patron", value: "patron" },
            { label: "Sponsor", value: "sponsor" },
            { label: "Corporate", value: "corporate" },
            { label: "SME", value: "sme" },
            { label: "Individual", value: "individual" },
          ],
        },
        {
          name: "sector",
          type: "text",
          label: "Sector",
          admin: { description: "e.g. Banking, Energy, Logistics" },
        },
      ],
    },
    {
      name: "website",
      type: "text",
      label: "Website",
      admin: { description: "Full website address, e.g. https://example.com" },
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: "Short company description",
      admin: { description: "Optional blurb shown in the member directory." },
    },
    {
      name: "membershipStatus",
      type: "select",
      required: true,
      defaultValue: "active",
      label: "Membership status",
      options: [
        { label: "Active", value: "active" },
        { label: "Pending", value: "pending" },
        { label: "Lapsed", value: "lapsed" },
      ],
      admin: {
        position: "sidebar",
        description: "Shown on the member’s portal dashboard.",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      label: "Show on homepage logo wall",
      admin: {
        position: "sidebar",
        description: "Turn on to feature this member’s logo on the homepage.",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "Display order",
      admin: {
        position: "sidebar",
        description: "Lower numbers appear first in lists and the logo wall.",
      },
    },
  ],
};
