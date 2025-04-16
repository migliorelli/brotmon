import { Enums } from "./database.types";
import { StatusEffect } from "./status-effect.type";

export enum Nature {
  NORMAL = "NORMAL",
  FIGHTING = "FIGHTING",
  FIRE = "FIRE",
  WATER = "WATER",
  GRASS = "GRASS",
  ELECTRIC = "ELECTRIC",
  ICE = "ICE",
  ROCK = "ROCK",
  GROUND = "GROUND",
  FLYING = "FLYING",
  BUG = "BUG",
  POISON = "POISON",
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

export type Move = {
  id: string;
  current_uses: number;
  base: {
    id: string;
    name: string;
    nature: Nature;
    type: Enums<"move_type">;
    power: number;
    accuracy: number;
    max_uses: number;
    always_crit: boolean;
    priority: number;
    effect: StatusEffect[];
  };
};

export type TurnBrotmon = {
  id: string;
  effects: StatusEffect[] | null;
  current_hp: number;
  base: {
    id: string;
    name: string;
    emoji: string;
    nature: Nature[];
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
};

export type TurnTrainer = {
  id: string;
  username: string;
  brotmons: TurnBrotmon[];
};

export type TurnAction = {
  id: string;
  action: "MOVE" | "SWITCH" | null;
  target_id: string | null;
  trainer: TurnTrainer;
  brotmon: TurnBrotmon;
};

export type BattleTurn = {
  id: string;
  battle_id: string;
  turn: number;
  done: boolean;
  host_action: TurnAction | null;
  guest_action: TurnAction | null;
};
