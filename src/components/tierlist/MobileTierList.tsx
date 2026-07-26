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

  const rankedCount = monsters.size - (state.tiers.unranked?.length ?? 0);

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

  const handleViewRankings = useCallback(() => setShowTiers(true), []);

  const handleReviewAgain = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, [dispatch]);

  /* ---- Tier View ---- */
  if (showTiers) {
    return (
      <div className="flex flex-col flex-1 bg-bg-base">
        <header className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h2 className="text-lg font-display text-text-primary uppercase tracking-wider">
            {t("TierList.viewTiers")}
          </h2>
          <button
            onClick={() => setShowTiers(false)}
            className="px-4 py-2 text-xs font-bold text-accent uppercase tracking-wider border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors"
            style={{ clipPath: "polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)" }}
          >
            {t("TierList.backToQueue")}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 cf-texture">
          {TIERS.map((tierMeta) => {
            const ids = state.tiers[tierMeta.slug] ?? [];
            const tierMonsters = ids
              .map((id) => monsters.get(id))
              .filter(Boolean) as MonsterConfig[];
            return (
              <div key={tierMeta.slug} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <TierBadge slug={tierMeta.slug} />
                  <span className="text-xs font-mono text-text-muted">
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

  /* ---- Queue View ---- */
  const total = monsters.size;
  const processed = total - state.mobileQueue.length;
  const current = processed + 1;

  return (
    <div className="flex flex-col flex-1 bg-bg-base">
      {/* View rankings link */}
      <div className="flex items-center justify-end px-4 py-2">
        <button
          onClick={() => setShowTiers(true)}
          className="text-xs font-mono text-text-secondary hover:text-accent transition-colors uppercase tracking-wider"
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
