"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import type { MonsterConfig, TierState, TierSlug } from "@/types";
import { TIERS } from "@/types";
import TierBadge from "./TierBadge";
import MonsterCard from "./MonsterCard";

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
  // ---- Read-only render (no DnD) ----
  if (readOnly) {
    return (
      <div className="flex flex-col gap-3 overflow-y-auto flex-1">
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

  // ---- Editable DnD render ----
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
      collisionDetection={pointerWithin}
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
      <DragOverlay>
        {activeMonster && (
          <MonsterCard monster={activeMonster} isDragOverlay />
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ---- DnD tier row ----

function TierRow({
  slug,
  monsters: tierMonsters,
}: {
  slug: TierSlug;
  monsters: MonsterConfig[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `tier-${slug}` });
  const ids = tierMonsters.map((m) => m.id);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex items-start gap-2 p-2 rounded-lg min-h-20
        border-2 border-dashed transition-colors
        ${isOver ? "border-green-400 bg-green-50 dark:bg-green-950" : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900"}
      `}
    >
      <div className="flex-shrink-0 w-[120px] flex items-center gap-2">
        <TierBadge slug={slug} />
      </div>
      <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-1.5 flex-wrap flex-1">
          {tierMonsters.map((monster) => (
            <MonsterCard key={monster.id} monster={monster} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// ---- Read-only row (no DnD) ----

function ReadOnlyRow({
  slug,
  monsters,
}: {
  slug: TierSlug;
  monsters: MonsterConfig[];
}) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg min-h-20 border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex-shrink-0 w-[120px] flex items-center gap-2">
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
      <div className="w-16 h-16 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
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
