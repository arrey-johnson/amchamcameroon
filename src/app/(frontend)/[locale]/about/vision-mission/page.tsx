import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

type Props = { params: Promise<{ locale: string }> };

/** Vision & Mission now lives on the Who We Are page. */
export default async function VisionMissionRedirect({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: "/about/who-we-are", locale });
}
