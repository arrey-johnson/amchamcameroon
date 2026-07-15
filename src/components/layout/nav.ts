export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

/** Build the main navigation from translated labels. */
export function buildNav(t: (key: string) => string): NavItem[] {
  return [
    {
      label: t("about"),
      href: "/about/who-we-are",
      children: [
        { label: t("whoWeAre"), href: "/about/who-we-are" },
        { label: t("visionMission"), href: "/about/vision-mission" },
        { label: t("embassyWord"), href: "/about/word-from-the-us-embassy" },
        { label: t("presidentWord"), href: "/about/word-from-the-president" },
        { label: t("board"), href: "/about/board" },
        { label: t("executive"), href: "/about/executive" },
      ],
    },
    {
      label: t("membership"),
      href: "/membership",
      children: [
        { label: t("whyJoin"), href: "/membership" },
        { label: t("categories"), href: "/membership/categories" },
        { label: t("directory"), href: "/membership/directory" },
        { label: t("apply"), href: "/membership/apply" },
      ],
    },
    { label: t("committees"), href: "/committees" },
    {
      label: t("events"),
      href: "/events",
      children: [
        { label: t("upcomingEvents"), href: "/events" },
        { label: t("pastEvents"), href: "/events?view=past" },
        { label: t("tradeMissions"), href: "/events?category=trade-mission" },
      ],
    },
    {
      label: t("pressroom"),
      href: "/news",
      children: [
        { label: t("news"), href: "/news" },
        { label: t("newsletters"), href: "/newsletters" },
        { label: t("gallery"), href: "/gallery" },
        { label: t("usNews"), href: "/us-news" },
      ],
    },
    { label: t("resources"), href: "/resources" },
    { label: t("contact"), href: "/contact" },
  ];
}
