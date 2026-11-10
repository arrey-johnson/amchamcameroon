import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { PortalShell } from "@/components/portal/PortalShell";
import { ProfileForm } from "@/components/portal/ProfileForm";
import { getPortalSession } from "@/lib/memberAuth";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalProfilePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await getPortalSession();
  if (!session) {
    redirect({ href: "/portal/login", locale });
    return null;
  }

  const t = await getTranslations({ locale, namespace: "portal" });
  const { account, member } = session;

  return (
    <PortalShell
      locale={locale}
      name={account.name || account.email}
      company={member?.name}
      labels={{
        badge: t("portalBadge"),
        dashboard: t("navDashboard"),
        profile: t("navProfile"),
        events: t("navEvents"),
        directory: t("navDirectory"),
        contact: t("navContact"),
        logout: t("logout"),
        liveSite: t("liveSite"),
      }}
    >
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          {t("profileTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("profileIntro")}</p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <ProfileForm
          defaults={{
            name: account.name || "",
            phone: account.phone || "",
            website: member?.website || "",
            description: member?.description || "",
          }}
          labels={{
            name: t("fieldName"),
            phone: t("fieldPhone"),
            website: t("fieldWebsite"),
            description: t("fieldDescription"),
            save: t("saveProfile"),
            saving: t("savingProfile"),
            success: t("profileSaved"),
            error: t("profileError"),
          }}
        />
      </div>
    </PortalShell>
  );
}
