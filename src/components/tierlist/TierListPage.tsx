"use client";

import { useMemo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { MonsterConfig, TierSlug } from "@/types";
import { TIERS } from "@/types";
import { useTierList } from "@/hooks/useTierList";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import DesktopTierList from "./DesktopTierList";
import MobileTierList from "./MobileTierList";
import TierBadge from "./TierBadge";
import TierRowCard from "./TierRowCard";
import ShareButton from "./ShareButton";
import LocaleSwitcher from "@/components/LocaleSwitcher";

interface Props {
  monsters: MonsterConfig[];
  sharedEncoded: string | null;
  maxId: number;
}

export default function TierListPage({
  monsters,
  sharedEncoded,
  maxId,
}: Props) {
  const t = useTranslations("TierList");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { state, dispatch, shareUrl } = useTierList(
    monsters,
    sharedEncoded,
    maxId,
  );

  const monsterMap = useMemo(() => {
    const map = new Map<number, MonsterConfig>();
    monsters.forEach((m) => map.set(m.id, m));
    return map;
  }, [monsters]);

  const handleMoveMonster = useCallback(
    (
      monsterId: number,
      fromTier: TierSlug,
      toTier: TierSlug,
      toIndex: number,
    ) => {
      dispatch({ type: "MOVE_MONSTER", monsterId, fromTier, toTier, toIndex });
    },
    [dispatch],
  );

  const encodedUrl = shareUrl();

  if (isDesktop === null) {
    return <div className="flex flex-col flex-1 h-full bg-bg-base" />;
  }

  /* ---- View-only mode (shared link) ---- */
  if (state.isViewOnly) {
    return (
      <div className="flex flex-col flex-1 h-full bg-bg-base">
        {/* Header */}
        <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-border-subtle bg-bg-elevated">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="font-display text-lg sm:text-xl text-accent uppercase tracking-wider hover:glow-text transition-all"
            >
              <span className="hidden sm:inline">rank.energy</span>
              <span className="sm:hidden">RE</span>
            </Link>
            <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 font-mono uppercase tracking-wider text-accent border border-accent/30 bg-accent/5 whitespace-nowrap">
              Viewing
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => dispatch({ type: "SET_EDIT_MODE" })}
              className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-black uppercase tracking-wider bg-accent hover:bg-accent-dim transition-colors duration-200 whitespace-nowrap"
              style={{
                clipPath:
                  "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
              }}
            >
              {isDesktop ? t("editList") : t("edit")}
            </button>
            <LocaleSwitcher />
          </div>
        </header>

        {/* Divider */}
        <hr className="divider-glow" />

        <div className="flex-1 p-2 sm:p-6 cf-texture min-h-0 overflow-y-auto">
          {isDesktop ? (
            <DesktopTierList
              tiers={state.tiers}
              monsters={monsterMap}
              onMoveMonster={handleMoveMonster}
              readOnly
            />
          ) : (
            <div className="flex flex-col gap-3">
              {TIERS.map((tierMeta) => {
                const ids = state.tiers[tierMeta.slug] ?? [];
                const tierMonsters = ids
                  .map((id) => monsterMap.get(id))
                  .filter(Boolean) as MonsterConfig[];
                if (tierMonsters.length === 0) return null;
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
          )}
        </div>
      </div>
    );
  }

  /* ---- Edit mode ---- */
  return (
    <div className="flex flex-col flex-1 h-full bg-bg-base">
      {/* Header */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-border-subtle bg-bg-elevated">
        <Link
          href="/"
          className="font-display text-lg sm:text-xl text-accent uppercase tracking-wider hover:glow-text transition-all"
        >
          <span className="hidden sm:inline">rank.energy</span>
          <span className="sm:hidden">RE</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={() => dispatch({ type: "RESET_ALL" })}
            disabled={!encodedUrl}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-default bg-bg-surface hover:border-accent/40 hover:text-accent transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-border-default disabled:hover:text-text-secondary"
            style={{
              clipPath:
                "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
            }}
          >
            {isDesktop ? t("resetAll") : t("reset")}
          </button>
          <ShareButton shareUrl={encodedUrl} disabled={!encodedUrl} />
          <LocaleSwitcher />
        </div>
      </header>

      {/* Divider */}
      <hr className="divider-glow" />

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 cf-texture min-h-0">
        {isDesktop ? (
          <DesktopTierList
            tiers={state.tiers}
            monsters={monsterMap}
            onMoveMonster={handleMoveMonster}
          />
        ) : (
          <MobileTierList
            state={state}
            monsters={monsterMap}
            dispatch={dispatch}
            encodedUrl={encodedUrl}
          />
        )}
      </div>
    </div>
  );
}
