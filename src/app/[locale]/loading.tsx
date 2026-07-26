export default function Loading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-zinc-300 dark:border-zinc-600 border-t-zinc-800 dark:border-t-zinc-200 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      </div>
    </div>
  );
}
