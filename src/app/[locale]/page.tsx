import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-bg-base p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 bg-gradient-to-b from-accent/40 to-transparent" />
      </div>

      <main className="flex flex-col items-center gap-10 text-center max-w-2xl relative z-10 animate-fade-in">
        {/* Logo mark — angled brackets with glow */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-1 font-mono text-accent text-sm tracking-[0.3em] uppercase opacity-70">
            <span className="w-6 h-px bg-accent/50" />
            rank
            <span className="w-6 h-px bg-accent/50" />
          </div>

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-normal tracking-[-0.02em] uppercase leading-[0.9]">
            <span className="text-text-primary">RANK</span>
            <span className="text-accent block glow-text">ENERGY</span>
          </h1>

          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-accent/40" />
            <span className="w-1.5 h-1.5 bg-accent rotate-45 animate-pulse-glow" />
            <div className="w-16 h-px bg-accent/40" />
            <span className="w-1.5 h-1.5 bg-accent rotate-45 animate-pulse-glow" />
            <div className="w-8 h-px bg-accent/40" />
          </div>
        </div>

        {/* Description — clean, high contrast */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-lg leading-relaxed">
          {t("description")}
        </p>

        {/* CTA — aggressive button, sharp edges */}
        <Link
          href="/tierlist"
          className="group relative inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-black uppercase tracking-wider bg-accent hover:bg-accent-dim transition-all duration-200"
          style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
        >
          <span className="relative z-10 flex items-center gap-3">
            {t("goToTierList")}
            <span className="text-lg group-hover:translate-x-1 transition-transform duration-200">
              ▸
            </span>
          </span>
          <div className="absolute inset-0 bg-accent blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
        </Link>

        {/* Stats row — gamified */}
        <div className="flex items-center gap-8 sm:gap-12 pt-4">
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-2xl font-bold text-accent">
              31
            </span>
            <span className="text-xs text-text-muted uppercase tracking-widest">
              Flavors
            </span>
          </div>
          <div className="w-px h-10 bg-border-default" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-2xl font-bold text-accent">
              7
            </span>
            <span className="text-xs text-text-muted uppercase tracking-widest">
              Tiers
            </span>
          </div>
          <div className="w-px h-10 bg-border-default" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-2xl font-bold text-accent">
              ∞
            </span>
            <span className="text-xs text-text-muted uppercase tracking-widest">
              Rankings
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
