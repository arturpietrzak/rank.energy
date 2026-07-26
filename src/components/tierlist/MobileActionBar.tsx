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
    <div className="flex flex-col gap-3 p-4 border-t border-border-subtle bg-bg-elevated">
      <div className="flex flex-wrap justify-center gap-2">
        {rankedTiers.map((tier) => (
          <button
            key={tier.slug}
            onClick={() => onRank(tier.slug)}
            disabled={!hasCurrent}
            className={`px-4 py-3 text-xs font-bold text-white uppercase tracking-wider transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed ${tier.color} hover:brightness-125`}
            style={{
              clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {t(`Tiers.${tier.slug}`)}
          </button>
        ))}
        <button
          onClick={onDidntDrink}
          disabled={!hasCurrent}
          className="px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-default bg-bg-surface hover:border-accent/40 hover:text-accent transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-border-default disabled:hover:text-text-secondary"
          style={{ clipPath: "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)" }}
        >
          {t("TierList.didntDrink")}
        </button>
      </div>
    </div>
  );
}
