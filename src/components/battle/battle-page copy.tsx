"use client";

import { useBattleConnection } from "@/hooks/use-battle-connection";
import { BattleAction, BattleState } from "@/types/old/battle.type";
import { useEffect } from "react";
import { toast } from "sonner";

type BattlePageProps = {
  battleId: string;
  id: string;
};

export function BattlePage({ battleId, id }: BattlePageProps) {
  const { battle, error, performAction } = useBattleConnection(id as string);

  useEffect(() => {
    if (error) {
      toast(error, { description: "Try reloading the page" });
    }
  }, [error]);

  const handleMoveSelect = async (moveIndex: number) => {
    if (!battle || battle.state !== BattleState.BATTLING) {
      toast("Can't perform move", {
        description: "The battle hasn't started or is already finished.",
      });
      return;
    }

    await performAction(0, {
      action: BattleAction.MOVE,
      moveIndex,
    });
  };

  if (!battle) return <div>Loading</div>;

  if (battle.state === BattleState.WAITING) {
    return <div>waiting for player</div>;
  }

  if (battle.winner !== -1) {
    return <div>the winner is {battle.trainers[battle.winner]?.name}</div>;
  }

  return (
    <div className="container mx-auto flex gap-8 py-8">
      <div className="flex-1 space-y-8">
        <div className="flex justify-end">
          {battle.trainers[1] && (
            <BrotmonCard
              brotmon={battle.trainers[1].brotmons[0]}
              isActive={true}
            />
          )}
        </div>

        <div className="flex justify-start">
          {battle.trainers[0] && (
            <div className="space-y-4">
              <BrotmonCard
                brotmon={battle.trainers[0].brotmons[0]}
                isActive={true}
              />

              <div className="grid grid-cols-2 gap-2">
                {battle.trainers[0].brotmons[0].moves.map((move, i) => (
                  <Button
                    key={i}
                    onClick={() => handleMoveSelect(i)}
                    disabled={battle.state !== BattleState.BATTLING}
                    variant={move.uses <= 0 ? "outline" : "default"}
                  >
                    {move.name} ({move.uses})
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-[400px]">
        <BattleLog logs={battle.logs} />
      </div>
    </div>
  );
}
