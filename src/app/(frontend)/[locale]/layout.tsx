import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Inter, Libre_Franklin } from "next/font/google";
import { routing } from "@/i18n/routing";
import { getSettings, getTickerItems } from "@/lib/queries";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Ticker } from "@/components/layout/Ticker";
import { FloatingStack } from "@/components/layout/FloatingStack";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import type { AppLocale } from "@/lib/payload";
import "@/app/globals.css";

// Cache pages briefly; CMS saves bust tags via hooks so edits still show quickly.
export const revalidate = 60;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const libre = Libre_Franklin({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-libre",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  let title = t("defaultTitle");
  let description = t("defaultDescription");
  try {
    const settings = await getSettings(locale as AppLocale);
    if (settings.siteTitle) title = settings.siteTitle;
    if (settings.siteDescription) description = settings.siteDescription;
  } catch {
    // fall back to translated defaults before the DB is seeded
  }
  return {
    title: { default: title, template: `%s — AmCham Cameroon` },
    description,
    icons: {
      icon: [{ url: "/icon-48.png", type: "image/png", sizes: "48x48" }],
      apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
      shortcut: "/favicon-32.png",
    },
    openGraph: { title, description, type: "website", locale },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [settings, tickerItems, tCommon] = await Promise.all([
    getSettings(locale as AppLocale),
    getTickerItems(locale as AppLocale),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "American Chamber of Commerce in Cameroon",
    alternateName: "AmCham Cameroon",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    foundingDate: "1994",
    description: settings.siteDescription || undefined,
    email: settings.emails?.[0]?.email,
    telephone: settings.phones?.[0]?.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address?.replace(/\n/g, ", "),
      addressLocality: "Douala",
      addressCountry: "CM",
    },
    sameAs: [settings.facebook, settings.twitter, settings.linkedin, settings.youtube].filter(
      Boolean,
    ),
  };

  return (
    <html lang={locale} className={`${inter.variable} ${libre.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Ticker
            items={tickerItems.map((i) => ({ id: i.id, text: i.text, url: i.url }))}
            latestLabel={tCommon("latest")}
            dismissLabel={tCommon("dismiss")}
          />
          <Header settings={settings} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <FloatingStack
            labels={{
              backToTop: tCommon("backToTop"),
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
