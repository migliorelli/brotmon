"use client";

import { createClient } from "@/lib/supabase/client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

type BrotmonItem = {
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
    <Card
      ref={setNodeRef}
      onClick={remove}
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
        isOverlay ? "cursor-grabbing" : "cursor-grab",
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
      <span>Drop Brotmon here</span>
    </div>
  );
}

type BrotmonSelectorProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function BrotmonSelector({ value, onChange }: BrotmonSelectorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [brotmonsData, setBrotmonsData] = useState<BrotmonItem[]>([]);

  useEffect(() => {
    const fetchBrotmons = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("brotmons").select("*");

      if (!error) {
        const items: BrotmonItem[] = data.map((b) => ({
          attack: b.attack,
          defense: b.defense,
          speed: b.speed,
          name: b.name,
          emoji: b.emoji,
          hp: b.hp,
          id: b.id,
        }));

        setBrotmonsData(items);
      }
    };

    fetchBrotmons();
  }, []);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { distance: 5 },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

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
    if (newValue[targetIndex - 1] === undefined && targetIndex > 0) {
      return;
    }

    newValue[targetIndex] = draggedId;
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
      <div className="grid h-[500px] grid-cols-3 gap-4">
        <div className="col-span-1 grid grid-cols-1 grid-rows-3 gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} id={index.toString()}>
              {value[index] ? (
                <SlotBrotmonCard
                  brotmon={brotmonsData.find((b) => b.id === value[index])!}
                  index={index}
                  remove={() => handleRemove(index)}
                />
              ) : (
                <EmptySlot index={index} />
              )}
            </div>
          ))}
        </div>

        <ScrollArea className="col-span-2 h-[500px]">
          <div className="mr-3 grid grid-cols-2 gap-2">
            {brotmonsData.map((b) => (
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
            brotmon={brotmonsData.find((b) => b.id === activeId)!}
            isOverlay={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
