import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const BoardMembers: CollectionConfig = {
  slug: "board-members",
  labels: { singular: "Leadership Profile", plural: "Leadership (Board & Executive)" },
  admin: {
    group: "About",
    useAsTitle: "name",
    defaultColumns: ["photo", "name", "role", "group", "year", "termEnd", "order"],
    description:
      "Board of Directors and Executive Office profiles. Upload or replace each person's portrait via the Photo field.",
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
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
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
    { name: "role", type: "text", required: true, localized: true, admin: { description: "e.g. President, Vice-President, Executive Director" } },
    { name: "company", type: "text" },
    { name: "bio", type: "textarea", localized: true },
    { name: "linkedin", type: "text", admin: { description: "Full LinkedIn profile URL" } },
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
