import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link, redirect } from "@/i18n/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { ForgotPasswordForm } from "@/components/portal/ForgotPasswordForm";
import { getPortalSession } from "@/lib/memberAuth";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string }> };

export default async function PortalForgotPasswordPage({ params }: Props) {
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
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy">
            {t("forgotTitle")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("forgotIntro")}</p>
        </div>

        <ForgotPasswordForm
          labels={{
            email: t("email"),
            submit: t("forgotSubmit"),
            submitting: t("forgotSubmitting"),
            errorMissing: t("forgotErrorMissing"),
            success: t("forgotSuccess"),
          }}
        />

        <p className="mt-6 text-center text-xs text-ink-soft">
          <Link href="/portal/login" className="font-semibold text-navy hover:text-red">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
