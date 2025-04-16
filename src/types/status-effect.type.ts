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
