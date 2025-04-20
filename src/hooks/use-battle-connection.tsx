"use client";

import { httpClient } from "@/lib/http-client";
import { createClient } from "@/lib/supabase/client";
import { BattleActionPayload } from "@/types/battle-service.types";
import { Enums, Tables } from "@/types/database.types";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

type Move = Tables<"moves">;
type BrotmonMove = Tables<"brotmon_moves"> & { base: Move };

type Brotmon = Tables<"trainer_brotmons"> & { base: Tables<"brotmons"> };
type BattleingBrotmon = Brotmon & { moves: BrotmonMove[] };
export type BattleingBrotmons = {
  trainer: BattleingBrotmon | null;
  opponent: BattleingBrotmon | null;
};

type Trainer = Tables<"trainers"> & { brotmons: Brotmon[] };

export type Log = Tables<"battle_logs"> & { turn: { turn: number } };

export type Message = {
  id: string;
  username: string;
  content: string;
  created_at: string;
};

enum BattleActionType {
  SET_TRAINER = "SET_TRAINER",
  SET_OPPONENT = "SET_OPPONENT",
  SET_BATTLEING_BROTMONS = "SET_BATTLEING_BROTMONS",
  SET_BATTLE_STATE = "SET_BATTLE_STATE",
  SET_WINNER = "SET_WINNER",
  SET_LOGS = "SET_LOGS",
}

type BattleReducerAction =
  | {
      type: BattleActionType.SET_TRAINER;
      payload: Trainer | null;
    }
  | {
      type: BattleActionType.SET_OPPONENT;
      payload: Trainer | null;
    }
  | {
      type: BattleActionType.SET_BATTLEING_BROTMONS;
      payload: BattleingBrotmons;
    }
  | {
      type: BattleActionType.SET_BATTLE_STATE;
      payload: Enums<"battle_state">;
    }
  | {
      type: BattleActionType.SET_WINNER;
      payload: string | null;
    }
  | {
      type: BattleActionType.SET_LOGS;
      payload: Log[];
    };

type BattleState = {
  trainer: Trainer | null;
  opponent: Trainer | null;
  battleingBrotmons: BattleingBrotmons;
  battleState: Enums<"battle_state">;
  winner: string | null;
  logs: Log[];
};

const initialState: BattleState = {
  trainer: null,
  opponent: null,
  winner: null,
  battleingBrotmons: { trainer: null, opponent: null },
  battleState: "WAITING",
  logs: [],
};

function battleReducer(state: BattleState, action: BattleReducerAction): BattleState {
  switch (action.type) {
    case BattleActionType.SET_TRAINER:
      return { ...state, trainer: action.payload };
    case BattleActionType.SET_OPPONENT:
      return { ...state, opponent: action.payload };
    case BattleActionType.SET_BATTLEING_BROTMONS:
      return { ...state, battleingBrotmons: action.payload };
    case BattleActionType.SET_WINNER:
      return { ...state, winner: action.payload };
    case BattleActionType.SET_BATTLE_STATE:
      return { ...state, battleState: action.payload };
    case BattleActionType.SET_LOGS:
      return { ...state, logs: action.payload };
    default:
      return state;
  }
}

type UseBattleConnectionReturn = {
  battle: BattleState;
  messages: Message[];
  connected: boolean;
  error: string | null;
  performAction: (action: BattleActionPayload) => Promise<void>;
  sendMessage: (username: string, content: string) => Promise<void>;
};

export function useBattleConnection(
  battle_id: string,
  trainer_id: string,
): UseBattleConnectionReturn {
  const supabase = createClient();
  const [battleState, dispatch] = useReducer(battleReducer, initialState);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // fetch initial data
  const fetchBattleData = useCallback(async () => {
    try {
      const { data: battle, error: battleError } = await supabase
        .from("battles")
        .select(
          `
          id, state, winner_id,
          host:trainers!host_id(
            *,
            brotmons:trainer_brotmons(
              *, 
              base:brotmons!brotmon_id(*),
              moves:brotmon_moves(
                *, base:moves!move_id(*)
              )
            )
          ),
          guest:trainers!guest_id(
            *,
            brotmons:trainer_brotmons(
              *, 
              base:brotmons!brotmon_id(*),
              moves:brotmon_moves(
                *, base:moves!move_id(*)
              )
            )
          )
        `,
        )
        .eq("id", battle_id)
        .single();

      if (battleError) throw battleError;

      const { data: actions, error: actionsError } = await supabase
        .from("battle_actions")
        .select("*")
        .eq("battle_id", battle_id);

      if (actionsError) throw actionsError;

      const isHost = battle.host.id === trainer_id;
      const trainer = isHost ? battle.host : battle.guest;
      const opponent = isHost ? battle.guest : battle.host;

      dispatch({ type: BattleActionType.SET_TRAINER, payload: trainer });
      dispatch({ type: BattleActionType.SET_OPPONENT, payload: opponent });
      dispatch({ type: BattleActionType.SET_BATTLE_STATE, payload: battle.state });
      dispatch({ type: BattleActionType.SET_WINNER, payload: battle.winner_id });

      if (actions.length > 0) {
        const trainerBrotmon = actions.find((a) => a.trainer_id === trainer_id)?.brotmon_id;
        const opponentBrotmon = actions.find((a) => a.trainer_id !== trainer_id)?.brotmon_id;

        dispatch({
          type: BattleActionType.SET_BATTLEING_BROTMONS,
          payload: {
            trainer: trainer?.brotmons.find((b) => b.id === trainerBrotmon) || null,
            opponent: opponent?.brotmons.find((b) => b.id === opponentBrotmon) || null,
          },
        });
        console.log(battleState);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  }, [battle_id, trainer_id, supabase]);

  // supabase subscriptions
  const setupSubscriptions = useCallback(() => {
    const newChannel = supabase.channel(`battle_${battle_id}`);

    // chat subscription
    newChannel.on("broadcast", { event: "message" }, (e) => {
      setMessages((prev) => [...prev, e.payload as Message]);
    });

    // battle updates
    newChannel.on<Tables<"battles">>(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "battles", filter: `id=eq.${battle_id}` },
      async (e) => {
        const battle = e.new;

        if (battle.state !== battleState.battleState) {
          dispatch({ type: BattleActionType.SET_BATTLE_STATE, payload: battle.state });
        }

        if (battle.winner_id && battle.state === "FINISHED") {
          dispatch({ type: BattleActionType.SET_WINNER, payload: battle.winner_id });
        }

        if (battle.state === "READY") {
          try {
            const { data, error } = await supabase
              .from("battles")
              .select(
                `
                host:trainers!host_id(
                  *,
                  brotmons:trainer_brotmons(
                    *, base:brotmons!brotmon_id(*)
                  )
                ),
                guest:trainers!guest_id(
                  *,
                  brotmons:trainer_brotmons(
                    *, base:brotmons!brotmon_id(*)
                  )
                )
                `,
              )
              .eq("id", battle_id)
              .single();

            if (error) throw error;

            const isHost = battle.host_id === trainer_id;
            dispatch({
              type: BattleActionType.SET_TRAINER,
              payload: isHost ? data.host : data.guest,
            });
            dispatch({
              type: BattleActionType.SET_OPPONENT,
              payload: isHost ? data.guest : data.host,
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update trainers");
          }
        }
      },
    );

    // battle actions
    newChannel.on<Tables<"battle_actions">>(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "battle_actions",
        filter: `battle_id=eq.${battle_id}`,
      },
      async (e) => {
        if (e.eventType === "INSERT" || e.eventType === "UPDATE") {
          try {
            const { data: actions, error } = await supabase
              .from("battle_actions")
              .select(
                `
                *, 
                brotmon:trainer_brotmons!brotmon_id(
                  *, 
                  base:brotmons!brotmon_id(*),
                  moves:brotmon_moves(
                    *, base:moves!move_id(*)
                  )
                )
                `,
              )
              .eq("battle_id", battle_id)
              .limit(2);

            if (error) throw error;

            const trainerAction = actions.find((a) => a.trainer_id === trainer_id);
            const opponentAction = actions.find((a) => a.trainer_id !== trainer_id);

            dispatch({
              type: BattleActionType.SET_BATTLEING_BROTMONS,
              payload: {
                trainer: trainerAction?.brotmon || null,
                opponent: opponentAction?.brotmon || null,
              },
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update battle actions");
          }
        }
      },
    );

    // battle logs
    newChannel.on<Tables<"battle_logs">>(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "battle_logs", filter: `battle_id=eq.${battle_id}` },
      async () => {
        try {
          const { data, error } = await supabase
            .from("battle_logs")
            .select("*, turn:battle_turns!turn_id(turn)")
            .eq("battle_id", battle_id)
            .order("created_at", { ascending: true });

          if (error) throw error;
          if (data) dispatch({ type: BattleActionType.SET_LOGS, payload: data });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to update battle logs");
        }
      },
    );

    newChannel.subscribe((status) => {
      setConnected(status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
    });

    channelRef.current = newChannel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [battle_id, trainer_id, supabase, battleState.battleState]);

  useEffect(() => {
    fetchBattleData();
  }, [fetchBattleData]);

  useEffect(() => {
    setupSubscriptions();
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [setupSubscriptions, supabase]);

  const performAction = useCallback(
    async (action: BattleActionPayload) => {
      try {
        const response = await httpClient.post(`/battle/${battle_id}/action`, { data: action });

        if (!response.status.toString().startsWith("2")) {
          throw new Error(response.data.message || "Failed to perform action");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to perform action");
      }
    },
    [battle_id],
  );

  const sendMessage = useCallback(
    async (username: string, content: string) => {
      if (!channelRef.current || !connected) {
        setError("Not connected to the battle channel");
        return;
      }

      try {
        const id = Date.now().toString();
        const created_at = new Date().toISOString();
        const message: Message = { id, content, username, created_at };

        setMessages((prev) => [...prev, message]);

        await channelRef.current.send({
          type: "broadcast",
          event: "message",
          payload: message,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      }
    },
    [connected],
  );

  return {
    battle: battleState,
    sendMessage,
    messages,
    performAction,
    error,
    connected,
  };
}
