import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link, redirect } from "@/i18n/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { LoginForm } from "@/components/portal/LoginForm";
import { getPortalSession } from "@/lib/memberAuth";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalLoginPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const session = await getPortalSession();
  if (session) redirect({ href: "/portal", locale });

  const t = await getTranslations({ locale, namespace: "portal" });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex justify-center">
            <BrandLogo className="h-12" />
          </Link>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-navy/60">
            {t("portalBadge")}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy">{t("loginTitle")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("loginIntro")}</p>
        </div>

        <LoginForm
          labels={{
            email: t("email"),
            password: t("password"),
            submit: t("signIn"),
            submitting: t("signingIn"),
            forgotPassword: t("forgotPassword"),
            errorMissing: t("errorMissing"),
            errorFailed: t("errorFailed"),
            errorDisabled: t("errorDisabled"),
          }}
        />

        <p className="mt-6 text-center text-xs text-ink-soft">
          {t("needAccount")}{" "}
          <Link href="/contact" className="font-semibold text-navy hover:text-red">
            {t("contactUs")}
          </Link>
        </p>
      </div>
    </div>
  );
}
