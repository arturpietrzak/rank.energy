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

  return (
    <div className="relative group">
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          clipPath: isDragOverlay
            ? "polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)"
            : "polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)",
          background: isDragOverlay
            ? "var(--color-bg-overlay)"
            : "var(--color-bg-surface)",
        }}
        {...attributes}
        {...listeners}
        className={`
          w-16 h-16 flex-shrink-0
          flex items-center justify-center overflow-hidden
          select-none touch-none
          transition-[border-color] duration-150
          border
          ${isDragOverlay
            ? "scale-110 border-accent cursor-grabbing"
            : isDragging
              ? "opacity-20 border-border-subtle"
              : "cursor-grab border-border-subtle hover:border-accent/50"
          }
        `}
      >
        {monster.image ? (
          <img
            src={monster.image}
            alt={name}
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        ) : (
          <span className="text-lg text-text-muted">?</span>
        )}
      </div>

      {/* Tooltip — only on non-dragging, non-overlay cards */}
      {!isDragging && !isDragOverlay && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 bg-bg-overlay border border-border-default text-text-primary text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
          style={{ clipPath: "polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)" }}
        >
          {name}
        </div>
      )}
    </div>
  );
}
