"use client";

import { useTranslations } from "next-intl";
import type { MonsterConfig } from "@/types";

interface Props {
  monster: MonsterConfig;
  onRemove?: (id: number) => void;
}

export default function TierRowCard({ monster, onRemove }: Props) {
  const t = useTranslations("Monsters");
  const name = t(`${monster.id}.name`);

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {monster.image ? (
          <img
            src={monster.image}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs text-zinc-400">?</span>
        )}
      </div>
      <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1 truncate">
        {name}
      </span>
      {onRemove && (
        <button
          onClick={() => onRemove(monster.id)}
          className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 font-medium"
        >
          ✕
        </button>
      )}
    </div>
  );
}
