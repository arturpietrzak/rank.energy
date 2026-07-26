"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const updateTooltip = useCallback(() => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipStyle({
        position: "fixed",
        left: rect.left + rect.width / 2,
        top: rect.top - 4,
        transform: "translate(-50%, -100%)",
      });
    }
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: monster.id });

  return (
    <div
      className="relative group"
      onMouseEnter={() => { updateTooltip(); setShowTooltip(true); }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        ref={(node) => {
          setNodeRef(node);
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
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

      {/* Tooltip via portal — escapes all overflow containers */}
      {!isDragging && !isDragOverlay && mounted && showTooltip &&
        createPortal(
          <div
            style={tooltipStyle}
            className="bg-bg-overlay border border-border-default text-text-primary text-xs px-2 py-1 pointer-events-none whitespace-nowrap z-[9999]"
          >
            {name}
          </div>,
          document.body,
        )
      }
    </div>
  );
}
