import { natureStrengths } from "@/data/nature";
import { Nature, TurnBrotmon } from "@/types/battle-service.types";
import { StatusEffect, StatusEffectEnum } from "@/types/status-effect.type";
import {
  InterruptiveEffectResult,
  StatusEffectHandler,
} from "./status-effect-handler";

export class BattleUtils {
  public static calculateDamage(
    power: number,
    attack: number,
    defense: number,
    stab: boolean,
    moveNature: Nature,
    targetNature: Nature[],
  ) {
    let damage = 0;
    const critical = Math.random() > 0.1 ? 1 : 2;
    damage = (((2 * critical) / 5 + 2) * power * (attack / defense)) / 50 + 2;

    const stabDamage = stab ? 1.5 : 1;
    const type1 = natureStrengths[moveNature].find((n) => n === targetNature[0])
      ? 2
      : 1;
    const type2 = natureStrengths[moveNature].find((n) => n === targetNature[1])
      ? 2
      : 1;
    const modifiers = stabDamage * type1 * type2;
    damage *= modifiers;

    const randomModifier =
      damage !== 1
        ? (Math.floor(Math.random() * (255 - 217 + 1)) + 217) / 255
        : 1;
    damage *= randomModifier;

    return Math.floor(damage);
  }

  public static getStatusMultiplier(
    modifier: keyof NonNullable<StatusEffect["modifiers"]>,
    effects: StatusEffect[],
  ) {
    return effects.reduce((acc, e) => {
      const isBuffOrDebuff =
        e.type === StatusEffectEnum.BUFF || e.type === StatusEffectEnum.DEBUFF;

      if (
        isBuffOrDebuff &&
        e.modifiers !== undefined &&
        e.modifiers[modifier]
      ) {
        return acc * (1 + (e.modifiers[modifier] ?? 0));
      }

      return acc;
    }, 1);
  }

  public static handleInterruptiveEffects(brotmon: TurnBrotmon): {
    brotmon: TurnBrotmon;
    interrupt: {
      cause: StatusEffectEnum;
      message?: string;
    } | null;
  } {
    return StatusEffectHandler.processInterruptiveEffects(brotmon);
  }

  public static applyStatusEffect(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
    moveName: string,
  ): { message: string | null } {
    return StatusEffectHandler.applyStatusEffect(brotmon, effect, moveName);
  }

  public static handleParalysis(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
  ): InterruptiveEffectResult {
    return StatusEffectHandler.handlers[StatusEffectEnum.PARALYZE](
      brotmon,
      effect,
    );
  }

  public static handleBrainrot(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
  ): InterruptiveEffectResult {
    return StatusEffectHandler.handlers[StatusEffectEnum.BRAINROT](
      brotmon,
      effect,
    );
  }

  public static handleSleep(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
  ): InterruptiveEffectResult {
    return StatusEffectHandler.handlers[StatusEffectEnum.SLEEP](
      brotmon,
      effect,
    );
  }
}
