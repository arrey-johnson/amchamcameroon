"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { SITE_PATHS } from "@/lib/sitePaths";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/**
 * Once the first page is idle, prefetch every top-level page so later clicks
 * render from the client router cache. Prefetching is a no-op in `next dev`.
 */
export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;

    const run = () => {
      for (const path of SITE_PATHS) router.prefetch(path || "/");
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 1000);
    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
