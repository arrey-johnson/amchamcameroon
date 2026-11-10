import type { GlobalConfig } from "payload";
import { anyone, editors } from "@/access";
import { revalidateGlobal } from "@/hooks/revalidate";

export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Settings",
  admin: {
    group: "Site",
    description:
      "Contact details, WhatsApp/call buttons, social links, form notification email, homepage stats, and search-engine text.",
  },
  access: {
    read: anyone,
    update: editors,
  },
  hooks: {
    afterChange: [revalidateGlobal("settings")],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Contact details",
          description: "Address, emails, and phones shown on the Contact page and footer.",
          fields: [
            {
              name: "address",
              type: "textarea",
              localized: true,
              label: "Office address",
            },
            {
              name: "emails",
              type: "array",
              label: "Public email addresses",
              fields: [{ name: "email", type: "email", required: true, label: "Email" }],
            },
            {
              name: "phones",
              type: "array",
              label: "Public phone numbers",
              fields: [{ name: "phone", type: "text", required: true, label: "Phone" }],
            },
            {
              name: "mapEmbedUrl",
              type: "text",
              label: "Google Maps link",
              admin: {
                description:
                  "Paste the Google Maps embed or share link for the AmCham office (example share link: https://maps.app.goo.gl/MfHah3ovtaYFErDFA).",
              },
            },
          ],
        },
        {
          label: "WhatsApp & call buttons",
          description: "Floating buttons visitors see on the website.",
          fields: [
            {
              name: "whatsappNumber",
              type: "text",
              label: "WhatsApp number",
              admin: {
                description: "Country code + number, without + or spaces. Example: 237677713705",
              },
            },
            {
              name: "whatsappMessage",
              type: "text",
              localized: true,
              label: "WhatsApp starter message",
              admin: {
                description: "Pre-filled message when someone opens the WhatsApp chat.",
              },
            },
            {
              name: "callNumber",
              type: "text",
              label: "Call button number",
              admin: {
                description: "Include the + and country code. Example: +237677713705",
              },
            },
          ],
        },
        {
          label: "Social media",
          description: "Links used in the website footer.",
          fields: [
            { name: "facebook", type: "text", label: "Facebook page URL" },
            { name: "twitter", type: "text", label: "X / Twitter profile URL" },
            { name: "linkedin", type: "text", label: "LinkedIn page URL" },
            { name: "youtube", type: "text", label: "YouTube channel URL" },
          ],
        },
        {
          label: "Form emails",
          description:
            "Where website form submissions are sent, and the automated no-reply confirmation visitors receive immediately after submitting.",
          fields: [
            {
              name: "fromAddress",
              type: "text",
              label: "From name & address",
              admin: {
                description:
                  "How emails appear to recipients, e.g. AmCham Cameroon <admin@amchamcam.org>. Must be your Hostinger mailbox or an alias of it.",
              },
            },
            {
              name: "adminNotifyEmail",
              type: "email",
              label: "Notify this inbox",
              admin: {
                description:
                  "Receives every contact form, membership application, and newsletter signup. Defaults to ed@amchamcam.org.",
              },
            },
            {
              name: "autoReplyEnabled",
              type: "checkbox",
              defaultValue: true,
              label: "Send automated confirmation to the visitor",
              admin: {
                description:
                  "When on, every contact, membership, and newsletter form instantly emails the visitor a no-reply confirmation.",
              },
            },
            {
              name: "autoReplySubject",
              type: "text",
              localized: true,
              label: "Contact confirmation subject",
              admin: {
                description:
                  "Subject for contact-form confirmations. Membership and newsletter use built-in copy.",
              },
            },
            {
              name: "autoReplyBody",
              type: "textarea",
              localized: true,
              label: "Contact confirmation message",
              admin: {
                description:
                  "Plain text for contact-form confirmations. Use {{name}} where the visitor’s name should appear. Membership and newsletter confirmations are automatic.",
              },
            },
          ],
        },
        {
          label: "U.S. news source",
          description: "How the homepage U.S. business news block is filled.",
          fields: [
            {
              name: "usNewsMode",
              type: "select",
              defaultValue: "curated",
              label: "How to fill U.S. news",
              options: [
                { label: "Hand-picked items (recommended)", value: "curated" },
                { label: "Automatic feed (needs approval)", value: "feed" },
              ],
            },
            {
              name: "usNewsFeedUrl",
              type: "text",
              label: "Feed address",
              admin: { description: "Only needed if you choose Automatic feed above." },
            },
          ],
        },
        {
          label: "Homepage numbers",
          description: "The key figures shown on the homepage (e.g. members, events).",
          fields: [
            {
              name: "stats",
              type: "array",
              label: "Stats",
              fields: [
                { name: "value", type: "text", required: true, label: "Number / value" },
                { name: "label", type: "text", required: true, localized: true, label: "Label under the number" },
              ],
            },
          ],
        },
        {
          label: "Search engines",
          description: "Default title and description used when Google or social media shares the site.",
          fields: [
            {
              name: "siteTitle",
              type: "text",
              localized: true,
              label: "Default website title",
            },
            {
              name: "siteDescription",
              type: "textarea",
              localized: true,
              label: "Default website description",
            },
          ],
        },
      ],
    },
  ],
};
