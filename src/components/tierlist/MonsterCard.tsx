"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import type { MonsterConfig } from "@/types";

interface Props {
  monster: MonsterConfig;
  isDragOverlay?: boolean;
}

export default function MonsterCard({ monster, isDragOverlay }: Props) {
  const t = useTranslations("Monsters");
  const name = t(`${monster.id}.name`);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: monster.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isDragOverlay ? 0.3 : 1,
  };

  return (
    <div className="relative group">
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          w-16 h-16 rounded-lg bg-white dark:bg-zinc-800
          border border-zinc-200 dark:border-zinc-700
          shadow-sm cursor-grab active:cursor-grabbing
          select-none touch-none flex-shrink-0
          flex items-center justify-center overflow-hidden
          ${isDragOverlay ? "shadow-lg ring-2 ring-green-400 scale-110" : ""}
          ${isDragging && !isDragOverlay ? "opacity-30" : ""}
        `}
      >
        {monster.image ? (
          <img
            src={monster.image}
            alt={name}
            className="w-full h-full object-contain rounded-lg pointer-events-none"
          />
        ) : (
          <span className="text-lg text-zinc-400">?</span>
        )}
      </div>
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {name}
      </div>
    </div>
  );
}
