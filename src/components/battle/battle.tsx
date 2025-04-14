import { RoleBattle } from "@/hooks/use-battle-connection";
import {
  BattleAction,
  BattleActionPayload,
  BattleState,
} from "@/types/old/battle.type";
import { toast } from "sonner";
import { BattleRender } from "./battle-render";

type BattleProps = {
  battle: RoleBattle;
  performAction: (trainerRole: 0 | 1, action: BattleActionPayload) => void;
};

export function Battle({ battle, performAction }: BattleProps) {
  const trainer = battle.trainers[battle.role]!;

  const handleSwitch = (brotmonIndex: number) => {
    performAction(battle.role, {
      action: BattleAction.SWITCH,
      brotmonIndex,
    });
  };

  const handleMove = (moveIndex: number) => {
    if (BattleState.BATTLING !== battle.state)
      return toast("Can't perform move", {
        description: "The battle hasn't started or is already finished.",
      });

    performAction(battle.role, {
      action: BattleAction.MOVE,
      moveIndex,
    });
  };

  return (
    <div className="grid h-[600px] grid-rows-3">
      {/* BATTLE RENDER SECTION */}
      <div className="row-span-2">
        <BattleRender battle={battle} />
      </div>

      {/* TEAM MANAGEMENT SECTION */}
      <div className="row-span-1 flex flex-col">
        {/* TRAINER BROTMONS */}
        <ul className="flex w-full items-center gap-4">
          {trainer.brotmons.map((brotmon, index) => (
            <li key={brotmon.id} onClick={() => handleSwitch(index)}>
              {brotmon.name}
            </li>
          ))}
        </ul>

        {/* BROTMON MOVES */}
        <div className="grid grid-cols-4 gap-4">
          {trainer.brotmons[0].moves.map((move, index) => (
            <div onClick={() => handleMove(index)}>
              <p>{move.name}</p>
              {/* @ts-ignore */}
              <p>{move.current_uses}</p>
              <p>{move.uses}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
