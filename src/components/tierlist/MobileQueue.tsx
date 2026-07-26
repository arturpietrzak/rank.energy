"use client";

import { useTranslations } from "next-intl";
import type { MonsterConfig } from "@/types";

interface Props {
  monster: MonsterConfig | undefined;
  current: number;
  total: number;
  onShare: () => void;
  onViewRankings: () => void;
  onReviewAgain: () => void;
}

export default function MobileQueue({
  monster,
  current,
  total,
  onShare,
  onViewRankings,
  onReviewAgain,
}: Props) {
  const t = useTranslations();
  const tMonsters = useTranslations("Monsters");
  const name = monster ? tMonsters(`${monster.id}.name`) : "";

  /* ---- All rated state ---- */
  if (!monster) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 p-6 animate-fade-in">
        <p className="text-lg font-display text-accent uppercase tracking-wider glow-text">
          {t("TierList.allRated")}
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={onShare}
            className="w-full py-3 text-sm font-bold text-black uppercase tracking-wider bg-accent hover:bg-accent-dim transition-colors duration-200"
            style={{ clipPath: "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)" }}
          >
            {t("TierList.share")}
          </button>
          <button
            onClick={onViewRankings}
            className="w-full py-3 text-sm font-bold text-text-primary uppercase tracking-wider border border-border-default bg-bg-surface hover:border-accent/40 hover:text-accent transition-all duration-200"
            style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}
          >
            {t("TierList.viewTiers")}
          </button>
          <button
            onClick={onReviewAgain}
            className="w-full py-2 text-xs text-text-muted hover:text-accent transition-colors uppercase tracking-wider"
          >
            {t("TierList.reviewAgain")}
          </button>
        </div>
      </div>
    );
  }

  /* ---- Active rating ---- */
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 p-6 animate-fade-in">
      {/* Progress */}
      <p className="font-mono text-xs text-text-muted uppercase tracking-[0.2em]">
        {t("TierList.queueProgress", { current, total })}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-0.5 bg-border-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300 ease-out"
          style={{ width: `${(current / total) * 100}%`, boxShadow: "0 0 8px var(--color-accent-glow)" }}
        />
      </div>

      {/* Monster card */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <div
          className="w-44 h-44 bg-bg-surface border border-border-subtle flex items-center justify-center overflow-hidden"
          style={{ clipPath: "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)" }}
        >
          {monster.image ? (
            <img
              src={monster.image}
              alt={name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-5xl text-text-muted">?</span>
          )}
        </div>

        <h2 className="text-xl font-bold text-text-primary text-center leading-tight">
          {name}
        </h2>
      </div>
    </div>
  );
}
