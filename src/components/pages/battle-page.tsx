"use client";

import { BattleLog } from "@/components/battle/battle-log";
import { BattleRender } from "@/components/battle/battle-render";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useBattleConnection } from "@/hooks/use-battle-connection";
import { BattleAction } from "@/types/battle-service.types";

type BattlePageProps = {
  battle_id: string;
  trainer_id: string;
};

export function BattlePage({ battle_id, trainer_id }: BattlePageProps) {
  const { battle, connected, messages, sendMessage, performAction, error } = useBattleConnection(
    battle_id,
    trainer_id,
  );

  if (!connected)
    return (
      <div>
        <Spinner />
      </div>
    );

  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[150px] overflow-y-auto">
            {messages.map((m) => (
              <p key={m.id}>
                {m.username}: {m.content}
              </p>
            ))}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const message = formData.get("mi") as string;
              if (message.length > 0) {
                sendMessage(battle.trainer?.username || "user", message);
                e.currentTarget.reset();
              }
            }}
          >
            <Input name="mi" />
          </form>
        </CardFooter>
      </Card>

      <BattleLog logs={battle.logs} />

      {battle.battleState === "WAITING" && (
        <div className="w-full">
          <div>Waiting for guest...</div>
        </div>
      )}

      {battle.battleState === "READY" && (
        <div className="w-full">
          <Button variant="outline" onClick={() => performAction({ action: BattleAction.START })}>
            Start battle
          </Button>
        </div>
      )}

      {battle.battleState === "BATTLEING" && (
        <>
          {/* BATTLE RENDER SECTION */}
          <div className="col-span-2">
            <BattleRender battleingBrotmons={battle.battleingBrotmons} />
          </div>

          {/* TEAM MANAGEMENT SECTION */}
          <Card className="col-span-2 row-span-1 flex flex-col">
            <CardContent>
              {/* TRAINER BROTMONS */}
              <p className="mb-2">Your Brotmons</p>
              <div className="flex w-full items-center gap-4">
                {battle?.trainer?.brotmons.map((brotmon) => (
                  <Button
                    key={brotmon.id}
                    disabled={brotmon.id === battle.battleingBrotmons.trainer?.id}
                    onClick={() =>
                      performAction({ action: BattleAction.SWITCH, brotmon_id: brotmon.id })
                    }
                    variant="outline"
                  >
                    {brotmon.base.name}
                  </Button>
                ))}
              </div>

              {/* BROTMON MOVES */}
              <p className="mt-4 mb-2">Your Moves</p>
              <div className="grid grid-cols-4 gap-4">
                {battle.battleingBrotmons.trainer?.moves.map((move) => (
                  <Button
                    key={move.id}
                    onClick={() => performAction({ action: BattleAction.MOVE, move_id: move.id })}
                    variant="outline"
                    disabled={move.current_uses <= 0}
                  >
                    {move.base.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
