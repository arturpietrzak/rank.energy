"use client";

import { useReducer, useCallback, useMemo } from "react";
import type { MonsterConfig, TierState, TierSlug } from "@/types";
import { initEmptyTierState } from "@/types";
import { decodeTierState, encodeTierState } from "@/lib/encoding";

// ---- State ----

export interface TierListState {
  tiers: TierState;
  mobileQueue: number[];
  history: Array<{ monsterId: number; from: TierSlug }>;
  isViewOnly: boolean;
}

// ---- Actions ----

export type TierListAction =
  | { type: "MOVE_MONSTER"; monsterId: number; fromTier: TierSlug; toTier: TierSlug; toIndex: number }
  | { type: "RANK_MONSTER"; monsterId: number; tier: TierSlug }
  | { type: "SKIP_MONSTER"; monsterId: number }
  | { type: "REMOVE_FROM_TIER"; monsterId: number }
  | { type: "UNDO_LAST_RANK"; monsterId: number }
  | { type: "RESET_ALL" }
  | { type: "RESET_QUEUE" }
  | { type: "SET_EDIT_MODE" };

// ---- Helpers ----

function createInitialTierState(monsters: MonsterConfig[]): TierState {
  const tiers = initEmptyTierState();
  tiers["unranked"] = monsters.map((m) => m.id);
  return tiers;
}

function moveMonsterInTiers(
  tiers: TierState,
  monsterId: number,
  fromTier: TierSlug,
  toTier: TierSlug,
  toIndex: number
): TierState {
  const next = { ...tiers };
  // Remove from source
  next[fromTier] = next[fromTier]?.filter((id) => id !== monsterId) ?? [];
  // Copy target and insert
  const target = [...(next[toTier] ?? [])];
  target.splice(toIndex, 0, monsterId);
  next[toTier] = target;
  return next;
}

// ---- Reducer ----

export function tierListReducer(
  state: TierListState,
  action: TierListAction
): TierListState {
  switch (action.type) {
    case "MOVE_MONSTER": {
      const { monsterId, fromTier, toTier, toIndex } = action;
      return {
        ...state,
        tiers: moveMonsterInTiers(state.tiers, monsterId, fromTier, toTier, toIndex),
      };
    }

    case "RANK_MONSTER": {
      const { monsterId, tier } = action;
      // Remove from unranked
      const nextTiers = { ...state.tiers };
      nextTiers.unranked = nextTiers.unranked.filter((id) => id !== monsterId);
      // Add to target tier (at end)
      nextTiers[tier] = [...(nextTiers[tier] ?? []), monsterId];
      // Remove from mobile queue
      const nextQueue = state.mobileQueue.filter((id) => id !== monsterId);
      // Push to history for undo
      return {
        ...state,
        tiers: nextTiers,
        mobileQueue: nextQueue,
        history: [...state.history, { monsterId, from: "unranked" }],
      };
    }

    case "SKIP_MONSTER": {
      // Remove from queue (stays in unranked tier)
      const nextQueue = state.mobileQueue.filter(
        (id) => id !== action.monsterId
      );
      return { ...state, mobileQueue: nextQueue };
    }

    case "REMOVE_FROM_TIER": {
      const { monsterId } = action;
      // Find which tier it's in (not unranked)
      let foundTier: TierSlug = "unranked";
      for (const tier of Object.keys(state.tiers) as TierSlug[]) {
        if (tier === "unranked") continue;
        if (state.tiers[tier]?.includes(monsterId)) {
          foundTier = tier;
          break;
        }
      }
      // Move from its tier back to unranked
      const nextTiers = { ...state.tiers };
      nextTiers[foundTier] = nextTiers[foundTier].filter((id) => id !== monsterId);
      // Add back to unranked
      nextTiers.unranked = [...nextTiers.unranked, monsterId];
      // Put at front of queue
      const nextQueue = [monsterId, ...state.mobileQueue.filter((id) => id !== monsterId)];
      return {
        ...state,
        tiers: nextTiers,
        mobileQueue: nextQueue,
      };
    }

    case "UNDO_LAST_RANK": {
      const last = state.history[state.history.length - 1];
      if (!last) return state;
      // Find which tier the monster is in
      let fromTier: TierSlug = "unranked";
      for (const tier of Object.keys(state.tiers) as TierSlug[]) {
        if (tier === "unranked") continue;
        if (state.tiers[tier]?.includes(action.monsterId)) {
          fromTier = tier;
          break;
        }
      }
      // Remove from tier
      const nextTiers = { ...state.tiers };
      nextTiers[fromTier] = nextTiers[fromTier].filter(
        (id) => id !== action.monsterId
      );
      // Add back to unranked
      nextTiers.unranked = [...nextTiers.unranked, action.monsterId];
      // Put at front of queue
      const nextQueue = [
        action.monsterId,
        ...state.mobileQueue.filter((id) => id !== action.monsterId),
      ];
      return {
        ...state,
        tiers: nextTiers,
        mobileQueue: nextQueue,
        history: state.history.slice(0, -1),
      };
    }

    case "RESET_ALL": {
      const tiers = initEmptyTierState();
      tiers["unranked"] = [...state.mobileQueue, ...state.tiers.unranked];
      // Collect all monster IDs from all tiers and put them in unranked
      const allIds = new Set<number>();
      for (const tier of Object.keys(state.tiers) as TierSlug[]) {
        for (const id of state.tiers[tier] ?? []) {
          allIds.add(id);
        }
      }
      // Rebuild: everything in unranked
      for (const tier of Object.keys(state.tiers) as TierSlug[]) {
        if (tier === "unranked") continue;
        tiers[tier] = [];
      }
      tiers.unranked = [...allIds];
      return {
        ...state,
        tiers,
        mobileQueue: [...allIds],
        history: [],
      };
    }

    case "RESET_QUEUE": {
      return { ...state, mobileQueue: [...state.tiers.unranked] };
    }

    case "SET_EDIT_MODE": {
      return { ...state, isViewOnly: false };
    }

    default:
      return state;
  }
}

// ---- Hook ----

export function useTierList(monsters: MonsterConfig[], sharedEncoded: string | null, maxId: number) {
  const validIds = useMemo(
    () => new Set(monsters.map((m) => m.id)),
    [monsters]
  );

  const [state, dispatch] = useReducer(tierListReducer, null, () => {
    const initial: TierListState = {
      tiers: createInitialTierState(monsters),
      mobileQueue: monsters.map((m) => m.id),
      history: [],
      isViewOnly: false,
    };

    if (sharedEncoded) {
      const decoded = decodeTierState(sharedEncoded, validIds, maxId);
      const allRanked = new Set<number>();
      for (const tier of Object.keys(decoded) as TierSlug[]) {
        if (tier === "unranked") continue;
        for (const id of decoded[tier]) {
          allRanked.add(id);
        }
      }
      const unranked = monsters
        .map((m) => m.id)
        .filter((id) => !allRanked.has(id));
      return {
        ...initial,
        tiers: { ...decoded, unranked },
        mobileQueue: unranked,
        isViewOnly: true,
      };
    }

    return initial;
  });

  const shareUrl = useCallback(() => {
    return encodeTierState(state.tiers, maxId);
  }, [state.tiers, maxId]);

  const getMonsterById = useCallback(
    (id: number) => monsters.find((m) => m.id === id),
    [monsters]
  );

  return { state, dispatch, shareUrl, getMonsterById, validIds };
}
