"use client";

import { useMemo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { MonsterConfig, TierSlug } from "@/types";
import { useTierList } from "@/hooks/useTierList";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import DesktopTierList from "./DesktopTierList";
import MobileTierList from "./MobileTierList";
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
        <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-elevated">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-xl text-accent uppercase tracking-wider hover:glow-text transition-all"
            >
              rank.energy
            </Link>
            <span className="text-[10px] px-2 py-0.5 font-mono uppercase tracking-wider text-accent border border-accent/30 bg-accent/5">
              Viewing
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => dispatch({ type: "SET_EDIT_MODE" })}
              className="px-5 py-2 text-sm font-bold text-black uppercase tracking-wider bg-accent hover:bg-accent-dim transition-colors duration-200"
              style={{
                clipPath:
                  "polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)",
              }}
            >
              {t("editList")}
            </button>
            <LocaleSwitcher />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 cf-texture">
          <DesktopTierList
            tiers={state.tiers}
            monsters={monsterMap}
            onMoveMonster={handleMoveMonster}
            readOnly
          />
        </div>
      </div>
    );
  }

  /* ---- Edit mode ---- */
  return (
    <div className="flex flex-col flex-1 h-full bg-bg-base">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-elevated">
        <Link
          href="/"
          className="font-display text-xl text-accent uppercase tracking-wider hover:glow-text transition-all"
        >
          <span className="hidden sm:inline">rank.energy</span>
          <span className="sm:hidden">RE</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => dispatch({ type: "RESET_ALL" })}
            disabled={!encodedUrl}
            className="px-4 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider border border-border-default bg-bg-surface hover:border-accent/40 hover:text-accent transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-border-default disabled:hover:text-text-secondary"
            style={{
              clipPath:
                "polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)",
            }}
          >
            {t("resetAll")}
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
