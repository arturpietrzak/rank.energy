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

interface Props {
  monsters: MonsterConfig[];
  sharedEncoded: string | null;
  maxId: number;
}

export default function TierListPage({ monsters, sharedEncoded, maxId }: Props) {
  const t = useTranslations("TierList");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { state, dispatch, shareUrl } = useTierList(monsters, sharedEncoded, maxId);

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
      toIndex: number
    ) => {
      dispatch({ type: "MOVE_MONSTER", monsterId, fromTier, toTier, toIndex });
    },
    [dispatch]
  );

  const encodedUrl = shareUrl();

  // View-only mode (shared link before editing): always show tier columns,
  // read-only, no drag, no queue — works on both desktop and mobile.
  // Don't render until we know the viewport width (prevents mobile flash on desktop)
  if (isDesktop === null) {
    return <div className="flex flex-col flex-1 h-full" />;
  }

  if (state.isViewOnly) {
    return (
      <div className="flex flex-col flex-1 h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 hover:underline">
              rank.energy
            </Link>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Viewing
            </span>
          </div>
          <button
            onClick={() => dispatch({ type: "SET_EDIT_MODE" })}
            className="rounded-full bg-zinc-800 dark:bg-zinc-200 px-4 py-2 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("editList")}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
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

  // Edit mode: responsive split
  return (
    <div className="flex flex-col flex-1 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          rank.energy
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: "RESET_ALL" })}
            disabled={!encodedUrl}
            className="rounded-full bg-zinc-200 dark:bg-zinc-700 px-4 py-2 text-sm font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("resetAll")}
          </button>
          <ShareButton shareUrl={encodedUrl} disabled={!encodedUrl} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
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
