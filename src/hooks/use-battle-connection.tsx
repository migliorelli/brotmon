"use client";

import { httpClient } from "@/lib/http-client";
import { createClient } from "@/lib/supabase/client";
import { BattleActionPayload } from "@/types/battle-service.types";
import { Tables } from "@/types/database.types";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type State as BattleState,
  ActionType as BattleActionType,
  useBattleReducer,
} from "./use-battle-reducer";

type Move = Tables<"moves">;
export type BrotmonMove = Tables<"brotmon_moves"> & { base: Move };

export type Brotmon = Tables<"trainer_brotmons"> & { base: Tables<"brotmons"> };
export type BattleingBrotmon = Brotmon & { moves: BrotmonMove[] };
export type BattleingBrotmons = {
  trainer: BattleingBrotmon | null;
  opponent: BattleingBrotmon | null;
};

export type Trainer = Tables<"trainers"> & { brotmons: Brotmon[] };
export type Opponent = Tables<"trainers">;
export type Log = Tables<"battle_logs"> & { turn: { turn: number } };

export type Message = {
  id: string;
  username: string;
  content: string;
  created_at: string;
};

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
  const [battleState, dispatch] = useBattleReducer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("battle_logs")
        .select("*, turn:battle_turns!turn_id(turn)")
        .eq("battle_id", battle_id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      dispatch({ type: BattleActionType.SET_LOGS, payload: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update battle logs");
    }
  }, [battle_id, supabase, dispatch]);

  // fetch turn
  const fetchTurn = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("battle_turns")
        .select("turn")
        .eq("battle_id", battle_id)
        .eq("done", false)
        .single();

      if (error) throw error;
      dispatch({ type: BattleActionType.SET_TURN, payload: data.turn });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update battle logs");
    }
  }, [battle_id, supabase, dispatch]);

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

      dispatch({ type: BattleActionType.SET_IS_HOST, payload: isHost });
      dispatch({ type: BattleActionType.SET_TRAINER, payload: trainer });
      dispatch({ type: BattleActionType.SET_OPPONENT, payload: opponent });
      dispatch({ type: BattleActionType.SET_BATTLE_STATE, payload: battle.state });
      dispatch({ type: BattleActionType.SET_WINNER, payload: battle.winner_id });

      if (actions.length > 0) {
        const trainerAction = actions.find((a) => a.trainer_id === trainer_id);
        const opponentAction = actions.find((a) => a.trainer_id !== trainer_id);

        const canMove = trainerAction?.action === null;
        const trainerBrotmon = trainerAction?.brotmon_id;
        const opponentBrotmon = opponentAction?.brotmon_id;

        dispatch({ type: BattleActionType.SET_CAN_MOVE, payload: canMove });
        dispatch({
          type: BattleActionType.SET_BATTLEING_BROTMONS,
          payload: {
            trainer: trainer?.brotmons.find((b) => b.id === trainerBrotmon) || null,
            opponent: opponent?.brotmons.find((b) => b.id === opponentBrotmon) || null,
          },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  }, [battle_id, trainer_id, supabase, dispatch]);

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
      async () => {
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
            .eq("battle_id", battle_id);

          if (error) throw error;

          const trainerAction = actions.find((a) => a.trainer_id === trainer_id);
          const opponentAction = actions.find((a) => a.trainer_id !== trainer_id);

          const canMove = trainerAction?.action === null;
          dispatch({ type: BattleActionType.SET_CAN_MOVE, payload: canMove });
          console.log(trainerAction);
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
      },
    );

    // battle logs
    newChannel.on<Tables<"battle_logs">>(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "battle_logs",
        filter: `battle_id=eq.${battle_id}`,
      },
      fetchLogs,
    );

    // battle turns
    newChannel.on<Tables<"battle_turns">>(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "battle_logs",
        filter: `battle_id=eq.${battle_id}`,
      },
      async (e) => {
        dispatch({ type: BattleActionType.SET_TURN, payload: e.new.turn });
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
  }, [battle_id, trainer_id, supabase, dispatch, battleState.battleState, fetchLogs]);

  useEffect(() => {
    fetchBattleData();
    fetchLogs();
    fetchTurn();
  }, [fetchBattleData, fetchLogs, fetchTurn]);

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
      } finally {
        dispatch({ type: BattleActionType.SET_CAN_MOVE, payload: false });
      }
    },
    [battle_id, dispatch],
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
