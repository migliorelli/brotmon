"use client";

import { availableBrotmons } from "@/data/brotmons";
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
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

type BrotmonItem = {
  name: string;
  emoji: string;
  max_hp: number;
  defense: number;
  speed: number;
  id: string;
};

function SlotBrotmonCard({
  id,
  index,
  remove,
}: {
  id: string;
  index: number;
  remove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: index.toString(),
  });

  const brotmon = availableBrotmons[id];

  return (
    <Card
      ref={setNodeRef}
      onClick={remove}
      className={clsx(
        "grid h-full cursor-pointer items-center select-none active:border-rose-200 active:bg-rose-100/50",
        isOver && "bg-gray-100",
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

  const style =
    transform && isOverlay
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "cursor-grab select-none",
        isDragging && `cursor-grabbing p-2 ${isDragging ? "opacity-30" : ""}`,
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
        "flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 select-none",
        isOver && "border-gray-400 bg-gray-100 text-gray-400",
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
          max_hp: b.max_hp,
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

    console.log(draggedId, targetIndex);

    if (typeof draggedId !== "string" || isNaN(targetIndex)) return;

    const newValue = [...value];

    if (!newValue[targetIndex - 1] && targetIndex > 1) {
      return;
    }

    newValue[targetIndex] = draggedId;
    console.log(newValue);
    onChange(newValue);
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    console.log(value, newValue);
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
                  id={value[index]}
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
          <div className="opacity-80">
            <BrotmonCard
              key={activeId}
              brotmon={brotmonsData.find((b) => b.id === activeId)!}
              isOverlay={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
