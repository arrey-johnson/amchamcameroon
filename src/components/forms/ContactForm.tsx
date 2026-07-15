"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitContact, type FormState } from "@/app/actions";

const initial: FormState = { status: "idle" };

const inputCls =
  "w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-navy";

export function ContactForm() {
  const t = useTranslations("forms");
  const locale = useLocale();
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-green/30 bg-green/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-7 w-7">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-navy">{t("successTitle")}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{t("contactSuccess")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("name")} *</span>
          <input name="name" required className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("email")} *</span>
          <input type="email" name="email" required className={inputCls} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("phone")}</span>
          <input name="phone" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("company")}</span>
          <input name="company" className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{t("subject")}</span>
        <input name="subject" className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{t("message")} *</span>
        <textarea name="message" required rows={6} className={inputCls} />
      </label>

      {state.status === "error" && (
        <p className="rounded-md bg-red/5 p-3 text-sm font-medium text-red" role="alert">
          {t("error")}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-red px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
      >
        {pending ? t("sending") : t("send")}
        {!pending && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden>
            <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </form>
  );
}
