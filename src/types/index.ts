export interface MonsterConfig {
  id: number;
  image: string;
}

export type TierSlug =
  | 'viking-berry'
  | 's'
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'be-power'
  | 'unranked';

export type TierState = Record<TierSlug, number[]>;

export interface TierMeta {
  slug: TierSlug;
  color: string;
}

export const TIERS: TierMeta[] = [
  { slug: 'viking-berry', color: 'bg-purple-700' },
  { slug: 's',             color: 'bg-red-600' },
  { slug: 'a',             color: 'bg-orange-600' },
  { slug: 'b',             color: 'bg-yellow-600' },
  { slug: 'c',             color: 'bg-green-600' },
  { slug: 'd',             color: 'bg-blue-600' },
  { slug: 'be-power',      color: 'bg-indigo-600' },
  { slug: 'unranked',      color: 'bg-zinc-700' },
];

/** 3-bit tier index for compact binary encoding (0-6 for the 7 ranked tiers) */
export const TIER_INDEX: Record<TierSlug, number> = {
  'viking-berry': 0,
  's':             1,
  'a':             2,
  'b':             3,
  'c':             4,
  'd':             5,
  'be-power':      6,
  'unranked':     -1,
};

export const INDEX_TO_TIER: Record<number, TierSlug> = {
  0: 'viking-berry',
  1: 's',
  2: 'a',
  3: 'b',
  4: 'c',
  5: 'd',
  6: 'be-power',
};

export function getRankedTiers(): TierMeta[] {
  return TIERS.filter((t) => t.slug !== 'unranked');
}

export function initEmptyTierState(): TierState {
  return Object.fromEntries(
    TIERS.map((t) => [t.slug, [] as number[]])
  ) as TierState;
}
