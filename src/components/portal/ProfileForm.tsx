"use client";

import { useActionState } from "react";
import { updateMemberProfile, type PortalAuthState } from "@/app/portal-actions";

const initial: PortalAuthState = { status: "idle" };

type Props = {
  defaults: {
    name: string;
    phone: string;
    website: string;
    description: string;
  };
  labels: {
    name: string;
    phone: string;
    website: string;
    description: string;
    save: string;
    saving: string;
    success: string;
    error: string;
  };
};

export function ProfileForm({ defaults, labels }: Props) {
  const [state, action, pending] = useActionState(updateMemberProfile, initial);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{labels.name}</span>
        <input
          name="name"
          required
          defaultValue={defaults.name}
          className="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{labels.phone}</span>
        <input
          name="phone"
          defaultValue={defaults.phone}
          className="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{labels.website}</span>
        <input
          name="website"
          defaultValue={defaults.website}
          className="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{labels.description}</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={defaults.description}
          className="w-full rounded-md border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-navy"
        />
      </label>

      {state.status === "success" && (
        <p className="rounded-md bg-green/10 px-3 py-2 text-sm font-medium text-green" role="status">
          {labels.success}
        </p>
      )}
      {state.status === "error" && (
        <p className="rounded-md bg-red/5 px-3 py-2 text-sm font-medium text-red" role="alert">
          {labels.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded-md bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-dark disabled:opacity-60"
      >
        {pending ? labels.saving : labels.save}
      </button>
    </form>
  );
}
