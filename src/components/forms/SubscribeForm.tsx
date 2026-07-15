"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { subscribeNewsletter, type FormState } from "@/app/actions";

const initial: FormState = { status: "idle" };

export function SubscribeForm({ dark = false }: { dark?: boolean }) {
  const t = useTranslations("footer");
  const tForms = useTranslations("forms");
  const locale = useLocale();
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);

  if (state.status === "success") {
    return (
      <p className={`text-sm font-medium ${dark ? "text-white" : "text-green"}`} role="status">
        ✓ {tForms("subscribeSuccess")}
      </p>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-md gap-2">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot */}
      <input
        type="text"
        name="website_hp"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <label className="sr-only" htmlFor="subscribe-email">
        {t("emailPlaceholder")}
      </label>
      <input
        id="subscribe-email"
        type="email"
        name="email"
        required
        placeholder={t("emailPlaceholder")}
        className={`min-w-0 flex-1 rounded-md border px-3.5 py-2.5 text-sm outline-none transition-colors ${
          dark
            ? "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-gold"
            : "border-ink/15 bg-white text-ink placeholder:text-ink-soft/60 focus:border-navy"
        }`}
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-md bg-red px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
      >
        {pending ? "…" : t("subscribe")}
      </button>
      {state.status === "error" && (
        <p className="mt-1 w-full text-xs text-red" role="alert">
          {tForms("error")}
        </p>
      )}
    </form>
  );
}
