"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDndContext,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import type { MonsterConfig, TierState, TierSlug } from "@/types";
import { TIERS } from "@/types";
import TierBadge from "./TierBadge";
import MonsterCard from "./MonsterCard";

const TIER_GLOW: Record<string, string> = {
  "viking-berry": "rgba(147,51,234,0.25)",
  s: "rgba(239,68,68,0.25)",
  a: "rgba(249,115,22,0.25)",
  b: "rgba(234,179,8,0.25)",
  c: "rgba(34,197,94,0.25)",
  d: "rgba(59,130,246,0.25)",
  "be-power": "rgba(99,102,241,0.25)",
  unranked: "rgba(82,82,82,0.25)",
};

interface Props {
  tiers: TierState;
  monsters: Map<number, MonsterConfig>;
  onMoveMonster: (
    monsterId: number,
    fromTier: TierSlug,
    toTier: TierSlug,
    toIndex: number
  ) => void;
  readOnly?: boolean;
}

export default function DesktopTierList({
  tiers,
  monsters,
  onMoveMonster,
  readOnly = false,
}: Props) {
  /* ---- Read-only render ---- */
  if (readOnly) {
    return (
      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        {TIERS.map((tier) => {
          const ids = tiers[tier.slug] ?? [];
          const tierMonsters = ids
            .map((id) => monsters.get(id))
            .filter(Boolean) as MonsterConfig[];
          return (
            <ReadOnlyRow
              key={tier.slug}
              slug={tier.slug}
              monsters={tierMonsters}
            />
          );
        })}
      </div>
    );
  }

  /* ---- Editable DnD render ---- */
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;

      const activeId = active.id as number;

      let fromTier: TierSlug | null = null;
      for (const tier of TIERS) {
        if (tiers[tier.slug]?.includes(activeId)) {
          fromTier = tier.slug;
          break;
        }
      }
      if (!fromTier) return;

      let toTier: TierSlug | null = null;
      let toIndex = 0;
      const overId = over.id;

      if (typeof overId === "string" && overId.startsWith("tier-")) {
        toTier = overId.replace("tier-", "") as TierSlug;
        toIndex = tiers[toTier]?.length ?? 0;
      } else {
        const overNum = overId as number;
        for (const tier of TIERS) {
          const ids = tiers[tier.slug] ?? [];
          const idx = ids.indexOf(overNum);
          if (idx >= 0) {
            toTier = tier.slug;
            toIndex = idx;
            break;
          }
        }
      }

      if (!toTier) return;
      if (fromTier === toTier && tiers[fromTier]?.indexOf(activeId) === toIndex) {
        return;
      }

      onMoveMonster(activeId, fromTier, toTier, toIndex);
    },
    [tiers, onMoveMonster]
  );

  const activeMonster = activeId !== null ? monsters.get(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        {TIERS.map((tier) => {
          const ids = tiers[tier.slug] ?? [];
          const tierMonsters = ids
            .map((id) => monsters.get(id))
            .filter(Boolean) as MonsterConfig[];
          return (
            <TierRow
              key={tier.slug}
              slug={tier.slug}
              monsters={tierMonsters}
            />
          );
        })}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeMonster && (
          <MonsterCard monster={activeMonster} isDragOverlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}

/* ---- Determine which tier is being hovered ---- */

function useTierOver(slug: TierSlug, tierMonsterIds: number[]): boolean {
  const { over } = useDndContext();
  if (!over) return false;

  // Direct droppable match
  const overId = over.id;
  if (typeof overId === "string" && overId === `tier-${slug}`) {
    return true;
  }

  // Hovering over a card that belongs to this tier
  if (typeof overId === "number" && tierMonsterIds.includes(overId)) {
    return true;
  }

  return false;
}

/* ---- DnD Tier Row ---- */

function TierRow({
  slug,
  monsters: tierMonsters,
}: {
  slug: TierSlug;
  monsters: MonsterConfig[];
}) {
  const { setNodeRef, isOver: droppableIsOver } = useDroppable({
    id: `tier-${slug}`,
  });
  const ids = tierMonsters.map((m) => m.id);
  const tierOver = useTierOver(slug, ids);
  const isOver = droppableIsOver || tierOver;
  const glow = TIER_GLOW[slug] ?? "rgba(82,82,82,0.25)";

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex items-start gap-3 p-3 min-h-[88px]
        border transition-colors duration-200
        bg-bg-surface
        ${isOver
          ? "border-accent"
          : "border-border-subtle"
        }
      `}
      style={{
        boxShadow: isOver
          ? `0 0 24px ${glow}, 0 0 16px var(--color-accent-glow), inset 0 0 16px ${glow}`
          : undefined,
      }}
    >
      {/* Left accent strip */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-200 ${
          isOver ? "bg-accent" : "bg-border-default"
        }`}
      />

      {/* Tier label */}
      <div className="flex-shrink-0 w-[100px] flex items-center pt-1 pl-1">
        <TierBadge slug={slug} />
      </div>

      {/* Monster cards */}
      <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-1.5 flex-wrap flex-1 min-h-[56px] items-start">
          {tierMonsters.map((monster) => (
            <MonsterCard key={monster.id} monster={monster} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

/* ---- Read-only Row ---- */

function ReadOnlyRow({
  slug,
  monsters,
}: {
  slug: TierSlug;
  monsters: MonsterConfig[];
}) {
  return (
    <div className="relative flex items-start gap-3 p-3 min-h-[88px] border border-border-subtle bg-bg-surface">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-border-default" />
      <div className="flex-shrink-0 w-[100px] flex items-center pt-1 pl-1">
        <TierBadge slug={slug} />
      </div>
      <div className="flex gap-1.5 flex-wrap flex-1">
        {monsters.map((monster) => (
          <ReadOnlyImage key={monster.id} monster={monster} />
        ))}
      </div>
    </div>
  );
}

function ReadOnlyImage({ monster }: { monster: MonsterConfig }) {
  const t = useTranslations("Monsters");
  const name = t(`${monster.id}.name`);

  return (
    <div className="relative group">
      <div className="w-16 h-16 bg-bg-overlay border border-border-subtle flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ clipPath: "polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)" }}>
        {monster.image ? (
          <img
            src={monster.image}
            alt={name}
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <span className="text-lg text-text-muted">?</span>
        )}
      </div>
      {/* Tooltip */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-bg-overlay border border-border-default text-text-primary text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
        style={{ clipPath: "polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)" }}>
        {name}
      </div>
    </div>
  );
}
