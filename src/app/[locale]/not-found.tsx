"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-bg-base p-8">
      <main className="flex flex-col items-center gap-8 text-center max-w-md animate-fade-in">
        {/* 404 display */}
        <div className="flex flex-col items-center gap-4">
          <div className="font-mono text-accent text-sm tracking-[0.3em] uppercase opacity-70">
            <span className="w-6 h-px bg-accent/50 inline-block align-middle mr-2" />
            Error
            <span className="w-6 h-px bg-accent/50 inline-block align-middle ml-2" />
          </div>
          <h1 className="font-display text-7xl text-accent glow-text">
            {t("title")}
          </h1>
        </div>

        <p className="text-lg text-text-secondary max-w-sm leading-relaxed">
          {t("description")}
        </p>

        <Link
          href="/"
          className="px-8 py-3 text-sm font-bold text-black uppercase tracking-wider bg-accent hover:bg-accent-dim transition-colors duration-200"
          style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
        >
          {t("returnHome")}
        </Link>
      </main>
    </div>
  );
}
