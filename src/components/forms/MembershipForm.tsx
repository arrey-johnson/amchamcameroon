"use client";

import { useActionState, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitMembership, type FormState } from "@/app/actions";
import { useUrlQuery } from "@/components/useUrlQuery";

const initial: FormState = { status: "idle" };

const inputCls =
  "w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-navy";

export function MembershipForm() {
  const t = useTranslations("forms");
  const tMember = useTranslations("membership");
  const locale = useLocale();
  const [state, action, pending] = useActionState(submitMembership, initial);
  const [step, setStep] = useState(0);

  // Controlled values so data survives step navigation inside one <form>.
  const [values, setValues] = useState({
    company: "",
    sector: "",
    employees: "",
    name: "",
    email: "",
    phone: "",
    category: "corporate",
    motivation: "",
  });

  const [query, sync] = useUrlQuery();
  const queryCategory = query.get("category");
  useEffect(() => {
    if (queryCategory) setValues((v) => ({ ...v, category: queryCategory }));
  }, [queryCategory]);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-green/30 bg-green/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-7 w-7">
            <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-navy">{t("successTitle")}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{t("membershipSuccess")}</p>
      </div>
    );
  }

  const steps = [t("companyInfo"), t("contactInfo"), t("membershipDetails")];
  const canNext =
    step === 0 ? values.company.trim().length > 0 : step === 1 ? values.name.trim() && /\S+@\S+\.\S+/.test(values.email) : true;

  return (
    <form action={action} className="rounded-xl border border-surface-alt bg-white p-6 shadow-sm sm:p-8">
      {sync}
      <input type="hidden" name="locale" value={locale} />
      <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {/* Step indicator */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-red">
          {t("step", { current: step + 1, total: steps.length })}
        </p>
        <div className="mt-3 flex items-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col gap-1.5">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-navy" : "bg-surface-alt"}`} />
              <span className={`text-[11px] font-semibold ${i <= step ? "text-navy" : "text-ink-soft/60"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 — company */}
      <div className={step === 0 ? "space-y-4" : "hidden"}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("company")} *</span>
          <input name="company" required value={values.company} onChange={set("company")} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("sector")}</span>
          <input name="sector" value={values.sector} onChange={set("sector")} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("employees")}</span>
          <select name="employees" value={values.employees} onChange={set("employees")} className={inputCls}>
            <option value="">—</option>
            <option>1–10</option>
            <option>11–50</option>
            <option>51–200</option>
            <option>200+</option>
          </select>
        </label>
      </div>

      {/* Step 2 — contact person */}
      <div className={step === 1 ? "space-y-4" : "hidden"}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("name")} *</span>
          <input name="name" required value={values.name} onChange={set("name")} className={inputCls} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">{t("email")} *</span>
            <input type="email" name="email" required value={values.email} onChange={set("email")} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">{t("phone")}</span>
            <input name="phone" value={values.phone} onChange={set("phone")} className={inputCls} />
          </label>
        </div>
      </div>

      {/* Step 3 — membership details */}
      <div className={step === 2 ? "space-y-4" : "hidden"}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("membershipCategory")}</span>
          <select name="category" value={values.category} onChange={set("category")} className={inputCls}>
            {(["patron", "sponsor", "corporate", "sme", "individual"] as const).map((c) => (
              <option key={c} value={c}>{tMember(`cats.${c}.name`)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">{t("motivation")}</span>
          <textarea name="motivation" rows={5} value={values.motivation} onChange={set("motivation")} className={inputCls} />
        </label>
      </div>

      {state.status === "error" && (
        <p className="mt-4 rounded-md bg-red/5 p-3 text-sm font-medium text-red" role="alert">
          {t("error")}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`rounded-md border-2 border-navy/20 px-5 py-2.5 text-sm font-bold text-navy transition-colors hover:border-navy ${step === 0 ? "invisible" : ""}`}
        >
          {t("back")}
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-md bg-navy px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-dark disabled:opacity-50"
          >
            {t("next")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-red px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-dark disabled:opacity-60"
          >
            {pending ? t("sending") : t("submitApplication")}
          </button>
        )}
      </div>
    </form>
  );
}
