import type { CollectionConfig } from "payload";
import { superAdmins, superAdminsField } from "@/access";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Administration",
    defaultColumns: ["email", "name", "role"],
  },
  access: {
    create: superAdmins,
    delete: superAdmins,
    // Users can read/update themselves; super admins manage everyone.
    read: ({ req }) => {
      if ((req.user as { role?: string } | null)?.role === "superadmin") return true;
      if (req.user) return { id: { equals: req.user.id } };
      return false;
    },
    update: ({ req }) => {
      if ((req.user as { role?: string } | null)?.role === "superadmin") return true;
      if (req.user) return { id: { equals: req.user.id } };
      return false;
    },
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "contributor",
      options: [
        { label: "Super Admin", value: "superadmin" },
        { label: "Editor", value: "editor" },
        { label: "Contributor", value: "contributor" },
      ],
      access: { update: superAdminsField },
      saveToJWT: true,
    },
  ],
};
