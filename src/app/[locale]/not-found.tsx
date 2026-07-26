import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black p-8">
      <main className="flex flex-col items-center gap-6 text-center max-w-md">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          404
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Page not found
        </p>
        <Link
          href="/"
          className="rounded-full bg-foreground px-6 py-2 text-background font-medium hover:opacity-90 transition-opacity"
        >
          Go home
        </Link>
      </main>
    </div>
  );
}
