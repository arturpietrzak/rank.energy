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

  if (!monster) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 p-6">
        <p className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
          {t("TierList.allRated")}
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={onShare}
            className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors"
          >
            {t("TierList.share")}
          </button>
          <button
            onClick={onViewRankings}
            className="w-full py-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
          >
            {t("TierList.viewTiers")}
          </button>
          <button
            onClick={onReviewAgain}
            className="w-full py-2 text-sm text-zinc-500 dark:text-zinc-400 underline"
          >
            {t("TierList.reviewAgain")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 p-6">
      <p className="text-sm text-zinc-400">
        {t("TierList.queueProgress", { current, total })}
      </p>

      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <div className="w-40 h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden">
          {monster.image ? (
            <img
              src={monster.image}
              alt={name}
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-4xl text-zinc-300">?</span>
          )}
        </div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 text-center">
          {name}
        </h2>
      </div>
    </div>
  );
}
