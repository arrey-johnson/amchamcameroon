"use client";

import { useEffect } from "react";

const EYE_OPEN =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

function enhancePasswordInput(input: HTMLInputElement) {
  if (input.dataset.amchamEye === "1") return;
  // Don't touch inputs React is about to replace; mark first then attach
  input.dataset.amchamEye = "1";

  const host =
    (input.closest(".field-type-text, .field-type-password, .field, .input-wrapper") as HTMLElement | null) ||
    input.parentElement;
  if (!host) return;

  host.classList.add("amcham-password-host");
  input.classList.add("amcham-password-input");

  // Remove stale button if React remounted the input but left an old eye
  host.querySelectorAll(":scope > .amcham-password-eye").forEach((el) => el.remove());

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "amcham-password-eye";
  btn.tabIndex = 0;
  btn.setAttribute("aria-label", "Show password");
  btn.innerHTML = EYE_OPEN;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    btn.innerHTML = showing ? EYE_OPEN : EYE_OFF;
    input.focus();
  });

  // Place after the input without wrapping (keeps Payload/React happy)
  if (input.nextSibling) {
    host.insertBefore(btn, input.nextSibling);
  } else {
    host.appendChild(btn);
  }
}

/** Show/hide eye for Payload admin password fields (login + user forms). */
export function PasswordEyeToggle() {
  useEffect(() => {
    const scan = () => {
      document.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach(enhancePasswordInput);
      // Also catch inputs that were toggled to text but still marked
      document
        .querySelectorAll<HTMLInputElement>("input.amcham-password-input[type='text']")
        .forEach((input) => {
          if (!input.dataset.amchamEye) enhancePasswordInput(input);
        });
    };

    scan();
    const t1 = window.setTimeout(scan, 100);
    const t2 = window.setTimeout(scan, 500);
    const t3 = window.setTimeout(scan, 1500);

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(scan);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  return (
    <span className="amcham-password-eye-boot" aria-hidden="true" style={{ display: "none" }} />
  );
}
