import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const BoardMembers: CollectionConfig = {
  slug: "board-members",
  labels: { singular: "Leadership Profile", plural: "Leadership (Board & Executive)" },
  admin: {
    group: "About",
    useAsTitle: "name",
    defaultColumns: ["group", "photo", "name", "role", "year", "termEnd", "order"],
    // board sorts before executive alphabetically, then by order within each section.
    defaultSort: "group",
    groupBy: true,
    pagination: { defaultLimit: 50 },
    description:
      "Use the section tabs above the list (Board of Directors vs Executive Office), or the Group-by control, so you edit the right people. Upload or replace portraits via Profile photo.",
    components: {
      beforeListTable: ["@/components/admin/LeadershipSectionTabs"],
    },
  },
  access: {
    read: anyone,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data;
        // Board terms are two years (e.g. 2024–2026). Default end = start + 2.
        if (typeof data.year === "number" && typeof data.termEnd !== "number") {
          data.termEnd = data.year + 2;
        }
        return data;
      },
    ],
    afterChange: [revalidateTags("board-members")],
    afterDelete: [revalidateTags("board-members")],
  },
  defaultSort: "group",
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "group",
      type: "select",
      required: true,
      defaultValue: "board",
      label: "Section",
      options: [
        { label: "Board of Directors", value: "board" },
        { label: "Executive Office", value: "executive" },
      ],
      admin: {
        description:
          "Board of Directors = elected officers & board members (public /about/board). Executive Office = staff (public /about/executive).",
        position: "sidebar",
      },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Profile photo",
      filterOptions: {
        mimeType: { contains: "image" },
      },
      admin: {
        description:
          "Portrait shown on the public Board / Executive pages. Click to upload a new image, choose one from the media library, or clear and replace an existing photo.",
      },
    },
    {
      name: "role",
      type: "text",
      required: true,
      localized: true,
      admin: {
        description:
          "Board: President, Vice-President, Treasurer, Board Member… EO: Director, Operations, Communications.",
      },
    },
    { name: "company", type: "text" },
    { name: "bio", type: "textarea", localized: true },
    { name: "linkedin", type: "text", admin: { description: "Full LinkedIn profile URL" } },
    {
      name: "year",
      type: "number",
      required: true,
      defaultValue: new Date().getFullYear(),
      label: "Term start year",
      admin: {
        position: "sidebar",
        description: "Start of the 2-year term (e.g. 2024 for 2024–2026, or 2027 for 2027–2029).",
      },
    },
    {
      name: "termEnd",
      type: "number",
      label: "Term end year",
      admin: {
        position: "sidebar",
        description: "End of the term (defaults to start + 2 if left empty).",
      },
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
