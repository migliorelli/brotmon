import { BattleingBrotmon, Brotmon, useBattleConnection } from "@/hooks/use-battle-connection";
import { BattleAction } from "@/types/battle-service.types";
import { Button } from "../ui/button";

type BattleControlsProps = {
  canMove: boolean;
  brotmons: Brotmon[];
  battleingBrotmon: BattleingBrotmon;
  performAction: ReturnType<typeof useBattleConnection>["performAction"];
};

export function BattleControls({
  canMove,
  brotmons,
  battleingBrotmon,
  performAction,
}: BattleControlsProps) {
  const handleSwitch = (brotmon_id: string) => {
    performAction({ action: BattleAction.SWITCH, brotmon_id });
  };

  const handleMove = (move_id: string) => {
    performAction({ action: BattleAction.MOVE, move_id });
  };

  if (!canMove) {
    return (
      <div>
        <p>Waiting for opponent move...</p>
      </div>
    );
  }

  return (
    <div>
      {/* TRAINER BROTMONS */}
      <p className="mb-2">Your Brotmons</p>
      <div className="flex w-full items-center gap-4">
        {brotmons.map((brotmon) => (
          <Button
            key={brotmon.id}
            disabled={brotmon.current_hp <= 0 || brotmon.id === battleingBrotmon.id}
            onClick={() => handleSwitch(brotmon.id)}
            variant={brotmon.current_hp <= 0 ? "destructive" : "outline"}
          >
            {brotmon.base.name}
          </Button>
        ))}
      </div>

      {/* BROTMON MOVES */}
      <p className="mt-4 mb-2">Your Moves</p>
      <div className="grid grid-cols-4 gap-4">
        {battleingBrotmon.moves.map((move) => (
          <Button
            key={move.id}
            onClick={() => handleMove(move.id)}
            variant="outline"
            disabled={move.current_uses <= 0}
          >
            {move.base.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
