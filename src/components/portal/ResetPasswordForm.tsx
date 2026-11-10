"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { memberResetPassword, type PortalAuthState } from "@/app/portal-actions";

const initial: PortalAuthState = { status: "idle" };

type Props = {
  token: string;
  labels: {
    password: string;
    confirm: string;
    submit: string;
    submitting: string;
    hint: string;
    errorShort: string;
    errorMismatch: string;
    errorToken: string;
    errorDisabled: string;
  };
};

export function ResetPasswordForm({ token, labels }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(memberResetPassword, initial);

  useEffect(() => {
    if (state.status === "success") {
      router.replace("/portal");
      router.refresh();
    }
  }, [state.status, router]);

  const errorText =
    state.message === "short"
      ? labels.errorShort
      : state.message === "mismatch"
        ? labels.errorMismatch
        : state.message === "disabled"
          ? labels.errorDisabled
          : state.message === "token"
            ? labels.errorToken
            : null;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{labels.password}</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy"
        />
        <span className="mt-1.5 block text-xs text-ink-soft">{labels.hint}</span>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{labels.confirm}</span>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy"
        />
      </label>

      {state.status === "error" && errorText && (
        <p className="rounded-md bg-red/5 px-3 py-2 text-sm font-medium text-red" role="alert">
          {errorText}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-red px-4 py-3 text-sm font-bold text-white transition hover:bg-red-dark disabled:opacity-60"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
