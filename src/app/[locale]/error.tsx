"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-bg-base p-8">
      <main className="flex flex-col items-center gap-8 text-center max-w-md animate-fade-in">
        {/* Error icon */}
        <div className="flex items-center gap-1 font-mono text-danger text-sm uppercase tracking-[0.3em]">
          <span className="w-6 h-px bg-danger/50" />
          Error
          <span className="w-6 h-px bg-danger/50" />
        </div>

        <h1 className="text-2xl font-display text-text-primary uppercase tracking-wider">
          System Failure
        </h1>

        <p className="text-text-secondary leading-relaxed">
          An unexpected error occurred. This has been logged — please try again.
        </p>

        <button
          onClick={unstable_retry}
          className="px-8 py-3 text-sm font-bold text-black uppercase tracking-wider bg-accent hover:bg-accent-dim transition-colors duration-200"
          style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
        >
          Retry
        </button>
      </main>
    </div>
  );
}
