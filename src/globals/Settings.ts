import type { GlobalConfig } from "payload";
import { anyone, editors } from "@/access";

export const Settings: GlobalConfig = {
  slug: "settings",
  admin: {
    group: "Administration",
    description: "Site-wide settings: contact details, floating buttons, socials, emails, SEO.",
  },
  access: {
    read: anyone,
    update: editors,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Contact",
          fields: [
            { name: "address", type: "textarea", localized: true },
            {
              name: "emails",
              type: "array",
              fields: [{ name: "email", type: "email", required: true }],
            },
            {
              name: "phones",
              type: "array",
              fields: [{ name: "phone", type: "text", required: true }],
            },
            { name: "mapEmbedUrl", type: "text", admin: { description: "Google Maps embed URL for the contact page." } },
          ],
        },
        {
          label: "Floating Buttons",
          fields: [
            { name: "whatsappNumber", type: "text", admin: { description: "International format without +, e.g. 237677713705" } },
            { name: "whatsappMessage", type: "text", localized: true },
            { name: "callNumber", type: "text", admin: { description: "E.164 format, e.g. +237677713705" } },
          ],
        },
        {
          label: "Social",
          fields: [
            { name: "facebook", type: "text" },
            { name: "twitter", type: "text" },
            { name: "linkedin", type: "text" },
            { name: "youtube", type: "text" },
          ],
        },
        {
          label: "Email",
          fields: [
            { name: "fromAddress", type: "text", admin: { description: "Sender, e.g. AmCham Cameroon <no-reply@amchamcam.org>" } },
            { name: "adminNotifyEmail", type: "email", admin: { description: "Inbox notified on each form submission." } },
            { name: "autoReplyEnabled", type: "checkbox", defaultValue: true },
            { name: "autoReplySubject", type: "text", localized: true },
            {
              name: "autoReplyBody",
              type: "textarea",
              localized: true,
              admin: { description: "Plain text body of the visitor auto-reply. {{name}} is replaced with the visitor's name." },
            },
          ],
        },
        {
          label: "U.S. News",
          fields: [
            {
              name: "usNewsMode",
              type: "select",
              defaultValue: "curated",
              options: [
                { label: "Curated (hand-picked items)", value: "curated" },
                { label: "Feed (RSS, requires approval)", value: "feed" },
              ],
            },
            { name: "usNewsFeedUrl", type: "text", admin: { description: "RSS feed URL used in Feed mode." } },
          ],
        },
        {
          label: "Homepage Stats",
          fields: [
            {
              name: "stats",
              type: "array",
              fields: [
                { name: "value", type: "text", required: true },
                { name: "label", type: "text", required: true, localized: true },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            { name: "siteTitle", type: "text", localized: true },
            { name: "siteDescription", type: "textarea", localized: true },
          ],
        },
      ],
    },
  ],
};
