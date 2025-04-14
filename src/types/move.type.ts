import { Brotmon, Nature } from "./brotmon.type";

export enum StatusEffectEnum {
  POISON = "POISON",
  BURN = "BURN",

  PARALYZE = "PARALYZE",
  SLEEP = "SLEEP",
  BRAINROT = "BRAINROT",

  BUFF = "BUFF",
  DEBUFF = "DEBUFF",
}

export type Modifiers = {
  attack?: number;
  defense?: number;
  speed?: number;
};

export type StatusEffect = {
  type: StatusEffectEnum;
  duration: number; // in turns, -1 for permanent
  chance: number; // 0 to 1
  modifiers?: Modifiers;
  name: string;
};

export enum MoveType {
  ATTACK = "ATTACK",
  STATUS = "STATUS",
}

export type Move = {
  name: string;
  nature: Nature;
  type: MoveType;
  effect: StatusEffect | null;
  uses: number;
  power: number;
  accuracy: number; // 0 to 1
  alwaysCrit: boolean;
  priority: number;

  beforeHit?: (attacker: Brotmon, defenser: Brotmon) => void;
  onHit: (attacker: Brotmon, defenser: Brotmon) => void;
};
