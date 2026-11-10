"use client";

import { useActionState } from "react";
import { memberForgotPassword, type PortalAuthState } from "@/app/portal-actions";

const initial: PortalAuthState = { status: "idle" };

type Props = {
  labels: {
    email: string;
    submit: string;
    submitting: string;
    errorMissing: string;
    success: string;
  };
};

export function ForgotPasswordForm({ labels }: Props) {
  const [state, action, pending] = useActionState(memberForgotPassword, initial);

  if (state.status === "success") {
    return (
      <p className="rounded-md bg-green/10 px-3 py-3 text-sm font-medium leading-relaxed text-green" role="status">
        {labels.success}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{labels.email}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy"
        />
      </label>

      {state.status === "error" && state.message === "missing" && (
        <p className="rounded-md bg-red/5 px-3 py-2 text-sm font-medium text-red" role="alert">
          {labels.errorMissing}
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
