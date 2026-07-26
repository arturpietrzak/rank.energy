"use client";

import { useLocale } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
] as const;

export default function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-0.5">
      {LOCALES.map(({ code, label }) => {
        const isActive = currentLocale === code;

        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            className={`
              text-xs px-2.5 py-1 font-bold uppercase tracking-wider
              transition-colors duration-200
              ${
                isActive
                  ? "bg-accent text-black cursor-default pointer-events-none"
                  : "text-text-secondary border border-border-default bg-bg-surface hover:text-accent hover:border-accent/40"
              }
            `}
            style={{
              clipPath: isActive
                ? "polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)"
                : "polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)",
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
