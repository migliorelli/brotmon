import { Enums } from "@/types/database.types";
import { useReducer } from "react";
import { BattleingBrotmons, Log, Opponent, Trainer } from "./use-battle-connection";

export enum ActionType {
  SET_TRAINER = "SET_TRAINER",
  SET_OPPONENT = "SET_OPPONENT",
  SET_BATTLEING_BROTMONS = "SET_BATTLEING_BROTMONS",
  SET_BATTLE_STATE = "SET_BATTLE_STATE",
  SET_WINNER = "SET_WINNER",
  SET_LOGS = "SET_LOGS",
  SET_IS_HOST = "SET_IS_HOST",
  SET_TURN = "SET_TURN",
}

type ReducerAction =
  | {
      type: ActionType.SET_TRAINER;
      payload: Trainer | null;
    }
  | {
      type: ActionType.SET_OPPONENT;
      payload: Opponent | null;
    }
  | {
      type: ActionType.SET_BATTLEING_BROTMONS;
      payload: BattleingBrotmons;
    }
  | {
      type: ActionType.SET_BATTLE_STATE;
      payload: Enums<"battle_state">;
    }
  | {
      type: ActionType.SET_WINNER;
      payload: string | null;
    }
  | {
      type: ActionType.SET_LOGS;
      payload: Log[];
    }
  | {
      type: ActionType.SET_IS_HOST;
      payload: boolean;
    }
  | {
      type: ActionType.SET_TURN;
      payload: number;
    };

export type State = {
  trainer: Trainer | null;
  opponent: Opponent | null;
  battleingBrotmons: BattleingBrotmons;
  battleState: Enums<"battle_state">;
  winner: string | null;
  logs: Log[];
  isHost: boolean;
  turn: number;
};

const initialState: State = {
  trainer: null,
  opponent: null,
  winner: null,
  battleingBrotmons: { trainer: null, opponent: null },
  battleState: "WAITING",
  logs: [],
  isHost: false,
  turn: 0,
};

function battleReducer(state: State, action: ReducerAction): State {
  switch (action.type) {
    case ActionType.SET_TRAINER:
      return { ...state, trainer: action.payload };
    case ActionType.SET_OPPONENT:
      return { ...state, opponent: action.payload };
    case ActionType.SET_BATTLEING_BROTMONS:
      return { ...state, battleingBrotmons: action.payload };
    case ActionType.SET_WINNER:
      return { ...state, winner: action.payload };
    case ActionType.SET_BATTLE_STATE:
      return { ...state, battleState: action.payload };
    case ActionType.SET_LOGS:
      return { ...state, logs: action.payload };
    case ActionType.SET_IS_HOST:
      return { ...state, isHost: action.payload };
    case ActionType.SET_TURN:
      return { ...state, turn: action.payload };
    default:
      return state;
  }
}

export function useBattleReducer() {
  const reducer = useReducer(battleReducer, initialState);

  return reducer;
}
