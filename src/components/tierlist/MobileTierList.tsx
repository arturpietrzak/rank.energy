"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { MonsterConfig, TierSlug } from "@/types";
import { TIERS } from "@/types";
import type { TierListState, TierListAction } from "@/hooks/useTierList";
import MobileQueue from "./MobileQueue";
import MobileActionBar from "./MobileActionBar";
import TierBadge from "./TierBadge";
import TierRowCard from "./TierRowCard";

interface Props {
  state: TierListState;
  monsters: Map<number, MonsterConfig>;
  dispatch: React.Dispatch<TierListAction>;
  encodedUrl: string;
}

export default function MobileTierList({ state, monsters, dispatch, encodedUrl }: Props) {
  const t = useTranslations();
  const [showTiers, setShowTiers] = useState(false);

  const queueMonster =
    state.mobileQueue.length > 0
      ? monsters.get(state.mobileQueue[0])
      : undefined;

  const rankedCount =
    monsters.size - (state.tiers.unranked?.length ?? 0);

  const handleRank = useCallback(
    (tier: TierSlug) => {
      if (state.mobileQueue.length === 0) return;
      const monsterId = state.mobileQueue[0];
      dispatch({ type: "RANK_MONSTER", monsterId, tier });
    },
    [state.mobileQueue, dispatch]
  );

  const handleDidntDrink = useCallback(() => {
    if (state.mobileQueue.length === 0) return;
    dispatch({ type: "SKIP_MONSTER", monsterId: state.mobileQueue[0] });
  }, [state.mobileQueue, dispatch]);

  const handleShare = useCallback(async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("list", encodedUrl);
    await navigator.clipboard.writeText(url.toString());
  }, [encodedUrl]);

  const handleViewRankings = useCallback(() => {
    setShowTiers(true);
  }, []);

  const handleReviewAgain = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, [dispatch]);

  // ---- Tier View ----
  if (showTiers) {
    return (
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold">
            {t("TierList.viewTiers")}
          </h2>
          <button
            onClick={() => setShowTiers(false)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-zinc-200 dark:bg-zinc-700 hover:opacity-90"
          >
            {t("TierList.backToQueue")}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          {TIERS.map((tierMeta) => {
            const ids = state.tiers[tierMeta.slug] ?? [];
            const tierMonsters = ids
              .map((id) => monsters.get(id))
              .filter(Boolean) as MonsterConfig[];
            return (
              <div key={tierMeta.slug} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <TierBadge slug={tierMeta.slug} />
                  <span className="text-xs text-zinc-400">
                    {tierMonsters.length}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {tierMonsters.map((monster) => (
                    <TierRowCard
                      key={monster.id}
                      monster={monster}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---- Queue View ----
  const total = monsters.size;
  const processed = total - state.mobileQueue.length;
  const current = processed + 1;

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-end px-4 py-2">
        <button
          onClick={() => setShowTiers(true)}
          className="text-sm text-zinc-500 dark:text-zinc-400 underline"
        >
          {t("TierList.viewTiers")} ({rankedCount}/{total})
        </button>
      </div>

      <MobileQueue
        monster={queueMonster}
        current={state.mobileQueue.length > 0 ? current : total}
        total={total}
        onShare={handleShare}
        onViewRankings={handleViewRankings}
        onReviewAgain={handleReviewAgain}
      />

      <MobileActionBar
        onRank={handleRank}
        onDidntDrink={handleDidntDrink}
        hasCurrent={state.mobileQueue.length > 0}
      />
    </div>
  );
}
