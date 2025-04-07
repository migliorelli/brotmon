"use client";

import { useEffect, useState } from "react";
import { getBattle } from "@/lib/battles";
import { Battle } from "@/types/battle";
import { If } from "@/components/If";
import { useApi } from "@/hooks/useApi";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function BattlePage({ params }: { params: { id: string } }) {
  const { connected, error, event, send } = useWebSocket();
  const [battle, setBattle] = useState<Battle | null>(null);

  useEffect(() => {
    if (connected) {
      // set emitters
      send("battle:join", { id: params.id });

      // set listeners
      event("battle:join", (data: Battle) => {
        setBattle(data);
      });
    }
  }, [connected]);

  if (!connected) {
    return <div>Connecting to the server...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!battle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Battle #{battle.id}</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl">
            {battle.host.emoji} {battle.host.name}
          </h2>
          <p>
            HP: {battle.host.brotmon.hp}/{battle.host.brotmon.maxHp}
          </p>
        </div>

        <If condition={!!battle.guest}>
          <div className="border p-4 rounded">
            <h2 className="text-xl">
              {battle.guest!.emoji} {battle.guest!.name}
            </h2>
            <p>
              HP: {battle.guest!.brotmon.hp}/{battle.guest!.brotmon.maxHp}
            </p>
          </div>
        </If>
      </div>

      <div className="mt-4">
        <h3 className="text-xl mb-2">Battle Log</h3>
        <div className="bg-gray-100 p-4 rounded">
          {battle.log.map((entry, index) => (
            <p key={index}>{entry}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
