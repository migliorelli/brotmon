import { Trainer } from "./trainer";

export enum BattleState {
  WAITING,
  READY,
  BATTLING,
  FINISHED,
}

export enum TrainerEnum {
  HOST,
  GUEST,
  NONE,
}

export type Battle = {
  id: string;

  host: Trainer;
  guest: Trainer | null;
  turn: TrainerEnum;

  log: string[];
  state: BattleState;
  winner: TrainerEnum;

  createdAt: number;
  lastUpdated: number;
};
