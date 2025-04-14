"use client";

import { useBattleConnection } from "@/hooks/use-battle-connection";
import { BattleAction, BattleState } from "@/types/old/battle.type";
import { useEffect } from "react";
import { toast } from "sonner";
import { BattleLog } from "../battle-log";
import { Button } from "../ui/button";
import { Battle } from "./battle";

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

  if (!battle) return <div>Loading</div>;

  const renderComponent = () => {
    if (battle.state === BattleState.WAITING) {
      return <div>waiting for guest</div>;
    }

    if (battle.state === BattleState.READY) {
      if (battle.role === 1) {
        return (
          <div>
            <Button
              onClick={() =>
                performAction(battle.role, { action: BattleAction.START })
              }
            >
              Start
            </Button>
          </div>
        );
      } else {
        return <div>wait until host starts</div>;
      }
    }

    if (battle.winner !== -1 && battle.state === BattleState.FINISHED) {
      return <div>the winner is {battle.trainers[battle.winner]?.name}</div>;
    }

    return <Battle battle={battle} performAction={performAction} />;
  };

  return (
    <div className="container mx-auto grid grid-cols-2 py-8">
      {renderComponent()}
      <BattleLog logs={battle.logs} />
    </div>
  );
}
