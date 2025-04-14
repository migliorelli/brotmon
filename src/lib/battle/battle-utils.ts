import { Brotmon } from "@/types/old/brotmon.type";
import { StatusEffectEnum } from "@/types/old/move.type";

export function getSpeedMultipliers(attacker: Brotmon, target: Brotmon) {
  const attackerSpeedMultiplier = attacker.effects
    .filter(
      (e) =>
        e.type === StatusEffectEnum.BUFF || e.type === StatusEffectEnum.DEBUFF,
    )
    .reduce((acc, e) => acc * (1 + (e.modifiers?.speed || 0)), 1);

  const targetSpeedMultiplier = attacker.effects
    .filter(
      (e) =>
        e.type === StatusEffectEnum.BUFF || e.type === StatusEffectEnum.DEBUFF,
    )
    .reduce((acc, e) => acc * (1 + (e.modifiers?.speed || 0)), 1);

  return [attackerSpeedMultiplier, targetSpeedMultiplier];
}
