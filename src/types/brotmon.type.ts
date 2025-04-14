import { Move, StatusEffect } from "./move.type";

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

export type BrotmonBase = {
  id: string;
  name: string;
  emoji: string;
  nature: [Nature] | [Nature, Nature];
  moves: Move[];
  max_hp: number;
  attack: number;
  defense: number;
  speed: number;
};

export type Brotmon = BrotmonBase & {
  current_hp: number;
  current_attack: number;
  current_defense: number;
  current_speed: number;
  effects: StatusEffect[];
};
