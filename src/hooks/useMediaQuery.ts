"use client";

import { useSyncExternalStore } from "react";

function subscribe(handler: () => void, query: string) {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return null;
}

export function useMediaQuery(query: string): boolean | null {
  return useSyncExternalStore(
    (handler) => subscribe(handler, query),
    () => getSnapshot(query),
    getServerSnapshot,
  );
}
