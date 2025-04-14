import { natureStrengths } from "@/data/nature";
import { Brotmon, Nature } from "@/types/old/brotmon.type";
import {
  Move,
  MoveType,
  StatusEffect,
  StatusEffectEnum,
} from "@/types/old/move.type";

// [attackerAttack, targetDefense]
function getMultipliers(attacker: Brotmon, target: Brotmon): [number, number] {
  const attackerAttackMultiplier = attacker.effects
    .filter(
      (e) =>
        e.type === StatusEffectEnum.BUFF || e.type === StatusEffectEnum.DEBUFF,
    )
    .reduce((acc, e) => acc * (1 + (e.modifiers?.attack || 0)), 1);

  const targetDefenseMultiplier = attacker.effects
    .filter(
      (e) =>
        e.type === StatusEffectEnum.BUFF || e.type === StatusEffectEnum.DEBUFF,
    )
    .reduce((acc, e) => acc * (1 + (e.modifiers?.defense || 0)), 1);

  return [attackerAttackMultiplier, targetDefenseMultiplier];
}

export function calculateDamage(
  move: Move | null,
  attacker: Brotmon,
  target: Brotmon,
  isBrainrot = false,
) {
  const [attackMultiplier, defenseMultiplier] = getMultipliers(
    attacker,
    target,
  );

  let damage = 0;
  if (isBrainrot) {
    const critical = Math.random() > 0.1 ? 1 : 2;

    damage =
      (((2 * critical) / 5 + 2) *
        40 *
        ((attacker.attack * attackMultiplier) /
          (attacker.defense * defenseMultiplier))) /
        50 +
      2;

    const randomModifier =
      (Math.floor(Math.random() * (255 - 217 + 1)) + 217) / 255;

    damage *= randomModifier;
  } else {
    if (!move) return damage;

    const critical = Math.random() > 0.1 ? 1 : 2;

    damage =
      (((2 * critical) / 5 + 2) *
        move.power *
        ((attacker.attack * attackMultiplier) /
          (target.defense * defenseMultiplier))) /
        50 +
      2;

    const stab = attacker.nature.includes(move.nature) ? 1.5 : 1;
    const type1 = natureStrengths[move.nature].find((n) => n === target.nature[0]) ? 2 : 1; // prettier-ignore
    const type2 = natureStrengths[move.nature].find((n) => n === target.nature[1]) ? 2 : 1; // prettier-ignore

    const modifiers = stab * type1 * type2;
    damage *= modifiers;

    let randomModifier = 1;
    if (damage !== 1) {
      randomModifier =
        (Math.floor(Math.random() * (255 - 217 + 1)) + 217) / 255;
    }

    damage *= randomModifier;
  }

  return damage;
}

export function applyStatusEffect(
  target: Brotmon,
  effect: StatusEffect | null,
) {
  if (!effect) return;

  const isBuffOrDebuffType = (type: StatusEffectEnum) =>
    type === StatusEffectEnum.BUFF || type === StatusEffectEnum.DEBUFF;

  const existingEffectIndex = target.effects.findIndex((e) =>
    isBuffOrDebuffType(e.type)
      ? effect.name === e.name
      : effect.type === e.type,
  );

  if (existingEffectIndex !== -1) {
    target.effects[existingEffectIndex].duration = effect.duration;
    return;
  }

  target.effects.push(effect);
}

export function processStatusEffect(brotmon: Brotmon): string[] {
  const logs: string[] = [];

  brotmon.effects = brotmon.effects.filter((effect) => {
    // always skip permanent effects
    if (effect.duration === -1) return true;

    // BUFF, DEBUFF, PARALYZE, SLEEP and BRAINROT are handled in battle logic
    switch (effect.type) {
      case StatusEffectEnum.POISON:
        const pDamage = Math.floor(brotmon.max_hp / 8);
        brotmon.current_hp = Math.max(0, brotmon.current_hp - pDamage);
        logs.push(`${brotmon.name} took ${pDamage} damage from poison!`);
        break;

      case StatusEffectEnum.BURN:
        const bDamage = Math.floor(brotmon.max_hp / 16);
        brotmon.current_hp = Math.max(0, brotmon.current_hp - bDamage);
        logs.push(`${brotmon.name} took ${bDamage} damage from burn!`);
        break;
    }

    effect.duration -= 1;
    return effect.duration > 0;
  });

  return logs;
}

export function createBrainrotMove(): Move {
  return {
    accuracy: 1,
    alwaysCrit: false,
    effect: null,
    name: "BRAINROT",
    nature: Nature.NORMAL,
    power: 40,
    priority: 0,
    type: MoveType.ATTACK,
    uses: 1,
    onHit() {},
  };
}
