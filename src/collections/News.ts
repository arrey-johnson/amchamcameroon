import type { CollectionConfig } from "payload";
import { anyStaff, editors, publishedOrStaff } from "@/access";
import { revalidateTags } from "@/hooks/revalidate";

export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "News article", plural: "News" },
  admin: {
    group: "News & media",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "_status"],
    description:
      "Articles and press releases for the News section. Save a draft while writing, then Publish when it should appear on the website. Fill English and French with the language switcher.",
  },
  access: {
    read: publishedOrStaff,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  hooks: {
    afterChange: [revalidateTags("news")],
    afterDelete: [revalidateTags("news")],
  },
  versions: { drafts: true },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: "Headline",
      admin: { description: "Main title visitors see in the news list and on the article page." },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "Web address name",
      admin: {
        description:
          "Short name used in the article link (e.g. amcham-opens-2026-forum). Use lowercase letters, numbers, and hyphens only.",
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "news",
      label: "Type of article",
      options: [
        { label: "News", value: "news" },
        { label: "Press Release", value: "press-release" },
        { label: "Op-Ed", value: "op-ed" },
        { label: "Policy", value: "policy" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "excerpt",
      type: "textarea",
      localized: true,
      label: "Short summary",
      admin: {
        description: "One or two sentences shown in news lists and previews. Keep it under ~40 words.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Cover photo",
      admin: { description: "Main image for the article card and top of the article page." },
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      label: "Full article",
      admin: { description: "Write the full story here. Use headings and lists to keep it easy to read." },
    },
    {
      name: "author",
      type: "text",
      label: "Author",
      admin: { position: "sidebar", description: "Optional. e.g. AmCham Cameroon Secretariat" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
      label: "Publish date",
      admin: {
        position: "sidebar",
        description: "Date shown on the article. The item only appears on the site after you Publish it.",
      },
    },
    {
      name: "tags",
      type: "array",
      label: "Tags",
      fields: [{ name: "tag", type: "text", label: "Tag" }],
      admin: {
        position: "sidebar",
        description: "Optional keywords to help group related articles.",
      },
    },
  ],
};
