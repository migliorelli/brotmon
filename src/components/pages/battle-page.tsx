"use client";

import { BattleLogs } from "@/components/battle/battle-logs";
import { BattleRender } from "@/components/battle/battle-render";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useBattleConnection } from "@/hooks/use-battle-connection";
import { BattleAction } from "@/types/battle-service.types";
import { BattleControls } from "../battle/battle-controls";

type BattlePageProps = {
  battle_id: string;
  trainer_id: string;
};

export function BattlePage({ battle_id, trainer_id }: BattlePageProps) {
  const { battle, connected, performAction, error } = useBattleConnection(
    battle_id,
    trainer_id,
  );

  if (!connected)
    return (
      <div className="m-auto">
        <Spinner />
        <p>Connecting</p>
      </div>
    );

  if (error) return <div>{error}</div>;

  const isWaiting = battle.battleState === "WAITING";
  const isReady = battle.battleState === "READY";

  const isBatteling =
    battle.battleState === "BATTLEING" &&
    battle.trainer !== null &&
    battle.opponent !== null &&
    battle.battleingBrotmons.trainer !== null &&
    battle.battleingBrotmons.opponent !== null;

  return (
    <div className="container p-4 mx-auto grid grid-cols-3 flex-1 gap-4">
      {isWaiting && (
        <div className="col-span-2 m-auto">
          <p>Waiting for guest...</p>
          <Button
            variant="outline"
            onClick={() =>
              navigator.clipboard.writeText(window.location.origin + `/battle/join/${battle_id}`)
            }
          >
            Copy invite
          </Button>
        </div>
      )}

      {isReady && (
        <div className="col-span-2 m-auto">
          <p>The battle is ready to start</p>
          {battle.isHost && (
            <Button variant="outline" onClick={() => performAction({ action: BattleAction.START })}>
              Start battle
            </Button>
          )}
        </div>
      )}

      {isBatteling && (
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Turn {battle.turn}</CardTitle>
          </CardHeader>
          <CardContent>
            <BattleRender battleingBrotmons={battle.battleingBrotmons} />
            <BattleControls
              battleingBrotmon={battle.battleingBrotmons.trainer!}
              canMove={battle.canMove}
              brotmons={battle.trainer?.brotmons!}
              performAction={performAction}
            />
          </CardContent>
        </Card>
      )}

      <BattleLogs logs={battle.logs} />
    </div>
  );
}
