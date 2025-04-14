import { Nature } from "@/types/old/brotmon.type";
import {
  Move,
  MoveType,
  StatusEffect,
  StatusEffectEnum,
} from "@/types/old/move.type";
import { applyStatusEffect, calculateDamage } from "./move-utils";

export function createAttackMove(
  name: string,
  nature: Nature,
  power: number,
  e: Omit<StatusEffect, "name"> | null = null,
  alwaysCrit: boolean = false,
  accuracy: number = 1,
  uses: number = 10,
  priority: number = 0,
): Move {
  const effect: StatusEffect | null = e
    ? {
        ...e,
        name: `${e?.type.toUpperCase()}-${name
          .toUpperCase()
          .replace(" ", "-")}`,
      }
    : null;

  return {
    name,
    nature,
    type: MoveType.ATTACK,
    power,
    accuracy,
    uses,
    effect,
    alwaysCrit,
    priority,
    onHit(attacker, defender) {
      const damage = calculateDamage(this, attacker, defender);

      defender.current_hp = Math.max(0, defender.current_hp - damage);

      if (effect) {
        applyStatusEffect(defender, effect);
      }
    },
  };
}

export function createStatusMove(
  name: string,
  nature: Nature,
  e: Omit<StatusEffect, "name"> | null = null,
  accuracy: number = 1,
  uses: number = 10,
  priority: number = 0,
): Move {
  const effect: StatusEffect | null = e
    ? {
        ...e,
        name: `${e?.type.toUpperCase()}-${name
          .toUpperCase()
          .replace(" ", "-")}`,
      }
    : null;

  return {
    name,
    nature,
    type: MoveType.STATUS,
    power: 0,
    accuracy,
    uses,
    alwaysCrit: false,
    priority,
    effect,
    onHit: (attacker, defender) => {
      applyStatusEffect(defender, effect);
    },
  };
}

export function createHealingMove(
  name: string,
  nature: Nature,
  healPercent: number,
  accuracy: number = 1,
  uses: number = 5,
  priority: number = 0,
): Move {
  return {
    name,
    nature,
    type: MoveType.STATUS,
    power: 0,
    accuracy,
    uses,
    effect: null,
    alwaysCrit: false,
    priority,
    onHit: (attacker, defender) => {
      const healAmount = Math.floor(attacker.max_hp * (healPercent / 100));
      attacker.current_hp = Math.min(
        attacker.max_hp,
        attacker.current_hp + healAmount,
      );
    },
  };
}

export function createBuffMove(
  name: string,
  nature: Nature,
  modifiers: { attack?: number; defense?: number; speed?: number },
  duration = -1,
  uses: number = 10,
  priority: number = 0,
): Move {
  const effect: StatusEffect = {
    type: StatusEffectEnum.BUFF,
    duration,
    chance: 1,
    modifiers,
    name: `BUFF-${name.toUpperCase().replace(" ", "-")}`,
  };

  return {
    name,
    nature,
    type: MoveType.STATUS,
    power: 0,
    accuracy: 1,
    uses,
    priority,
    alwaysCrit: false,
    effect,
    onHit: (attacker, defender) => {
      // apply boost to self
      applyStatusEffect(attacker, effect);
    },
  };
}

export function createDebuffMove(
  name: string,
  nature: Nature,
  modifiers: { attack?: number; defense?: number; speed?: number },
  duration = -1,
  uses: number = 10,
  priority: number = 0,
): Move {
  const effect: StatusEffect = {
    type: StatusEffectEnum.DEBUFF,
    duration,
    chance: 1,
    modifiers,
    name: `DEBUFF-${name.toUpperCase().replace(" ", "-")}`,
  };

  return {
    name,
    nature,
    type: MoveType.STATUS,
    power: 0,
    accuracy: 1,
    uses,
    priority,
    alwaysCrit: false,
    effect,
    onHit: (attacker, defender) => {
      // apply boost to self
      applyStatusEffect(attacker, effect);
    },
  };
}
