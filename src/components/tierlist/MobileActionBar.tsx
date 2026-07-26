"use client";

import { useTranslations } from "next-intl";
import type { TierSlug } from "@/types";
import { getRankedTiers } from "@/types";

interface Props {
  onRank: (tier: TierSlug) => void;
  onDidntDrink: () => void;
  hasCurrent: boolean;
}

export default function MobileActionBar({ onRank, onDidntDrink, hasCurrent }: Props) {
  const t = useTranslations();
  const rankedTiers = getRankedTiers();

  return (
    <div className="flex flex-col gap-3 p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-wrap justify-center gap-2">
        {rankedTiers.map((tier) => (
          <button
            key={tier.slug}
            onClick={() => onRank(tier.slug)}
            disabled={!hasCurrent}
            className={`px-4 py-3 rounded-xl text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-30 ${tier.color}`}
          >
            {t(`Tiers.${tier.slug}`)}
          </button>
        ))}
        <button
          onClick={onDidntDrink}
          disabled={!hasCurrent}
          className="px-4 py-3 rounded-xl text-white font-bold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-30 bg-gray-400"
        >
          {t("TierList.didntDrink")}
        </button>
      </div>
    </div>
  );
}
