"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black p-8">
      <main className="flex flex-col items-center gap-6 text-center max-w-md">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Something went wrong
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={unstable_retry}
          className="rounded-full bg-foreground px-6 py-2 text-background font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </main>
    </div>
  );
}
