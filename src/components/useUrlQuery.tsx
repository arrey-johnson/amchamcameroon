"use client";

import { Suspense, useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

function QuerySync({ onChange }: { onChange: (query: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    onChange(new URLSearchParams(searchParams.toString()));
  }, [searchParams, onChange]);
  return null;
}

/**
 * Read the URL query without opting the page out of static prerendering.
 * `useSearchParams` lives in a null-rendering child behind Suspense, so the
 * prerendered HTML shows the default (unfiltered) state and the client
 * applies the query right after hydration. Render the returned `sync` node.
 */
export function useUrlQuery(): [URLSearchParams, ReactNode] {
  const [query, setQuery] = useState(() => new URLSearchParams());
  const sync = (
    <Suspense fallback={null}>
      <QuerySync onChange={setQuery} />
    </Suspense>
  );
  return [query, sync];
}

/**
 * Click handler for filter links: updates the query via the History API so the
 * filter switches instantly without a server round-trip. Modified clicks
 * (new tab, etc.) fall through to the normal link behaviour.
 */
export function pushQuery(e: MouseEvent<HTMLAnchorElement>) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  window.history.pushState(null, "", e.currentTarget.href);
}
