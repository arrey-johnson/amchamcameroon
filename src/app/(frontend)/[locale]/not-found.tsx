import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-7xl font-extrabold text-navy">404</p>
      <span className="mt-2 text-2xl text-red" aria-hidden>★</span>
      <h1 className="mt-4 text-2xl font-bold text-navy">{t("title")}</h1>
      <p className="mt-2 text-ink-soft">{t("text")}</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-red px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-dark"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
