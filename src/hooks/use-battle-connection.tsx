import { Battle, BattleActionPayload } from "@/types/old/battle.type";
import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

export type RoleBattle = Battle & { role: 0 | 1 };

export function useBattleConnection(battleId: string) {
  const [battle, setBattle] = useState<RoleBattle | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/battle/${battleId}/connect`);

    eventSource.onmessage = (event) => {
      const res = JSON.parse(event.data);

      switch (res.type) {
        case "battle:update":
          setBattle(res.data);
          break;
        case "connection":
          if (res.data.error) {
            setError("An error ocurred when trying to connect");
          }
          break;
      }
    };

    eventSource.onerror = () => {
      setError("Conection lost");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [battleId]);

  const performAction = useCallback(
    async (trainerRole: 0 | 1, action: BattleActionPayload) => {
      try {
        const response = await fetch(`/api/battle/${battleId}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ battleId, trainerRole, action }),
        });

        if (!response.ok) {
          throw new Error("Error performing action");
        }
      } catch (e) {
        const error = e as AxiosError<{ error: string }>;
        setError(error.response?.data.error ?? "Unknown error");
      }
    },
    [battleId],
  );

  return { battle, error, performAction };
}
