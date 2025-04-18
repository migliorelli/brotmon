import { natureStrengths } from "@/data/nature";
import { Nature } from "@/types/battle-service.types";
import { StatusEffect, StatusEffectEnum } from "@/types/status-effect.type";

export class BattleUtils {
  public static calculateDamage(
    power: number,
    attack: number,
    defense: number,
    stab: boolean,
    moveNature: Nature,
    targetNature: Nature[],
    alwaysCrit: boolean,
  ) {
    let damage = 0;
    const critical = Math.random() > 0.1 || alwaysCrit ? 1 : 2;
    damage = (((2 * critical) / 5 + 2) * power * (attack / defense)) / 50 + 2;

    const stabDamage = stab ? 1.5 : 1;
    const type1 = natureStrengths[moveNature].find((n) => n === targetNature[0]) ? 2 : 1;
    const type2 = natureStrengths[moveNature].find((n) => n === targetNature[1]) ? 2 : 1;
    const modifiers = stabDamage * type1 * type2;
    damage *= modifiers;

    const randomModifier =
      damage !== 1 ? (Math.floor(Math.random() * (255 - 217 + 1)) + 217) / 255 : 1;
    damage *= randomModifier;

    return [Math.floor(damage), critical === 2] as const;
  }

  public static getStatusMultiplier(
    modifier: keyof NonNullable<StatusEffect["modifiers"]>,
    effects: StatusEffect[],
  ) {
    return effects.reduce((acc, e) => {
      const isBuffOrDebuff = e.type === StatusEffectEnum.BUFF || e.type === StatusEffectEnum.DEBUFF;

      if (isBuffOrDebuff && e.modifiers !== undefined && e.modifiers[modifier]) {
        return acc * (1 + (e.modifiers[modifier] ?? 0));
      }

      return acc;
    }, 1);
  }
}
