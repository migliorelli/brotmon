"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useState } from "react";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

export type BrotmonItem = {
  name: string;
  emoji: string;
  hp: number;
  defense: number;
  speed: number;
  id: string;
};

function SlotBrotmonCard({
  index,
  remove,
  brotmon,
}: {
  index: number;
  brotmon: BrotmonItem;
  remove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: index.toString(),
  });

  return (
    <div onClick={remove} className="h-full">
      <Card
        ref={setNodeRef}
        className={clsx(
          "active:border-destructive/50 active:bg-destructive/10 grid h-full cursor-pointer items-center select-none",
          isOver && "bg-secondary",
        )}
      >
        <div className="flex items-center gap-2">
          <span>{brotmon.emoji}</span>
          <span>{brotmon.name}</span>
        </div>
      </Card>
    </div>
  );
}

function BrotmonCard({
  brotmon,
  isOverlay = false,
}: {
  brotmon: BrotmonItem;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: brotmon.id });

  const style = {
    transform:
      transform && isOverlay ? CSS.Transform.toString(transform) : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "select-none",
        isOverlay
          ? "border-muted-foreground/20 dark:border-secondary cursor-grabbing border-3"
          : "cursor-grab",
        isDragging && "opacity-30",
      )}
    >
      <div className="flex items-center gap-2">
        <span>{brotmon.emoji}</span>
        <span>{brotmon.name}</span>
      </div>
    </Card>
  );
}

function EmptySlot({ index }: { index: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id: index.toString(),
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "border-ring text-muted-foreground flex h-full items-center justify-center rounded-lg border-2 border-dashed select-none",
        isOver && "bg-muted",
      )}
    >
      <span>🫳 Drop Brotmon here</span>
    </div>
  );
}

type BrotmonSelectorProps = {
  brotmons: BrotmonItem[];
  value: string[];
  onChange: (value: string[]) => void;
};

export function BrotmonSelector({
  brotmons,
  value,
  onChange,
}: BrotmonSelectorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 500, tolerance: 10 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const draggedId = active.id;
    const targetIndex = parseInt(over.id as string);

    if (typeof draggedId !== "string" || isNaN(targetIndex)) return;

    const newValue = [...value];

    const newIndex = newValue[targetIndex - 1] === undefined ? newValue.length : targetIndex;
    newValue[newIndex] = draggedId;

    onChange(newValue);
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="grid h-[500px] gap-12 md:grid-cols-3 md:gap-4">
        <div className="grid grid-cols-3 gap-4 md:col-span-1 md:grid-cols-1 md:grid-rows-3">
          {[0, 1, 2].map((index) => (
            <div key={index} id={index.toString()}>
              {value[index] ? (
                <SlotBrotmonCard
                  brotmon={brotmons.find((b) => b.id === value[index])!}
                  index={index}
                  remove={() => handleRemove(index)}
                />
              ) : (
                <EmptySlot index={index} />
              )}
            </div>
          ))}
        </div>

        <ScrollArea className="h-[500px] md:col-span-2">
          <div className="mr-3 grid grid-cols-2 gap-2">
            {brotmons.map((b) => (
              <div key={b.id} draggable data-id={b.id}>
                <BrotmonCard brotmon={b} />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <DragOverlay>
        {activeId ? (
          <BrotmonCard
            key={activeId}
            brotmon={brotmons.find((b) => b.id === activeId)!}
            isOverlay={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
