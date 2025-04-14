import { Trainer } from "./trainer.type";

export enum BattleState {
  WAITING,
  READY,
  BATTLEING,
  FINISHED,
}

export enum BattleAction {
  MOVE,
  SWITCH,
  FORFEIT,
  START,
}

export type BattleActionPayload =
  | { action: BattleAction.MOVE; move_id: string }
  | { action: BattleAction.SWITCH; brotmon_id: string }
  | { action: BattleAction.FORFEIT }
  | { action: BattleAction.START };

export type Log = {
  date: number;
  message: string;
};

export type Battle = {
  id: string;

  trainers: [Trainer | null, Trainer | null]; // [host, guest]
  moves: [BattleActionPayload | null, BattleActionPayload | null];
  turn: number;

  logs: Log[][];
  state: BattleState;
  winner: -1 | 0 | 1;

  createdAt: number;
  lastUpdated: number;
};
