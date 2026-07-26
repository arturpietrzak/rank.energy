import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black p-8">
      <main className="flex flex-col items-center gap-8 text-center max-w-md">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {t("description")}
        </p>
        <Link
          href="/tierlist"
          className="rounded-full bg-foreground px-8 py-3 text-background font-medium hover:opacity-90 transition-opacity"
        >
          Go to Tier List
        </Link>
      </main>
    </div>
  );
}
