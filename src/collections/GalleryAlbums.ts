import type { CollectionConfig } from "payload";
import { anyone, anyStaff, editors } from "@/access";

export const GalleryAlbums: CollectionConfig = {
  slug: "gallery-albums",
  labels: { singular: "Photo Album", plural: "Photo Gallery" },
  admin: {
    group: "Pressroom",
    useAsTitle: "title",
    defaultColumns: ["title", "date"],
  },
  access: {
    read: anyone,
    create: anyStaff,
    update: anyStaff,
    delete: editors,
  },
  defaultSort: "-date",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "date", type: "date", required: true },
    { name: "cover", type: "upload", relationTo: "media" },
    {
      name: "images",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text", localized: true },
      ],
    },
  ],
};
