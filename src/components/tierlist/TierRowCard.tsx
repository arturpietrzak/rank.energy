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
    <div
      className="flex items-center gap-2.5 p-2.5 bg-bg-surface border border-border-subtle hover:border-accent/30 transition-colors duration-150"
      style={{ clipPath: "polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)" }}
    >
      <div
        className="w-9 h-9 bg-bg-overlay border border-border-subtle flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ clipPath: "polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)" }}
      >
        {monster.image ? (
          <img
            src={monster.image}
            alt={name}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-xs text-text-muted">?</span>
        )}
      </div>

      <span className="text-sm text-text-primary flex-1 truncate font-medium">
        {name}
      </span>

      {onRemove && (
        <button
          onClick={() => onRemove(monster.id)}
          className="text-xs px-2 py-1 font-bold text-danger uppercase tracking-wider border border-danger/30 bg-danger/10 hover:bg-danger/20 transition-colors"
          style={{ clipPath: "polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)" }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
