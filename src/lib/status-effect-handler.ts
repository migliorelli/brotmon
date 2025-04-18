import { TurnBrotmon } from "@/types/battle-service.types";
import { StatusEffect, StatusEffectEnum } from "@/types/status-effect.type";
import { BattleUtils } from "./battle-utils";

export type InterruptiveEffectResult = {
  interrupt: boolean;
  message?: string;
  brotmon: TurnBrotmon;
};

export type InterruptiveEffectHandler = (
  brotmon: TurnBrotmon,
  effect: StatusEffect,
) => InterruptiveEffectResult;

export class StatusEffectHandler {
  // @ts-ignore
  static handlers: Record<StatusEffectEnum, InterruptiveEffectHandler> = {
    [StatusEffectEnum.PARALYZE]: (
      brotmon: TurnBrotmon,
      effect: StatusEffect,
    ): InterruptiveEffectResult => {
      const result = {
        brotmon,
        interrupt: false,
      } as InterruptiveEffectResult;

      const removeEffect = () => {
        brotmon.effects = (brotmon.effects as StatusEffect[]).filter((e) => e.name !== effect.name);
      };

      if (effect.duration > 0) {
        effect.duration--;
        // 1/4 chance of being paralyzed
        if (Math.random() < 1 / 4) {
          result.message = `${brotmon.base.name} is paralyzed! It can't move!`;
          result.interrupt = true;
        }
      } else {
        result.message = `${brotmon.base.name} is no longer paralyzed!`;
        removeEffect();
      }

      return result;
    },

    [StatusEffectEnum.BRAINROT]: (
      brotmon: TurnBrotmon,
      effect: StatusEffect,
    ): InterruptiveEffectResult => {
      const result = {
        brotmon,
        interrupt: false,
      } as InterruptiveEffectResult;

      const removeEffect = () => {
        brotmon.effects = (brotmon.effects as StatusEffect[]).filter((e) => e.name !== effect.name);
      };

      if (effect.duration > 0) {
        effect.duration--;
        // 1/2 chance of self damage
        if (Math.random() < 1 / 2) {
          const attackMultiplier = BattleUtils.getStatusMultiplier(
            "attack",
            brotmon.effects as StatusEffect[],
          );

          const defenseMultiplier = BattleUtils.getStatusMultiplier(
            "defense",
            brotmon.effects as StatusEffect[],
          );

          let selfDamage = 0;
          const critical = Math.random() > 0.1 ? 1 : 2;

          selfDamage =
            (((2 * critical) / 5 + 2) *
              40 *
              ((brotmon.base.attack * attackMultiplier) /
                (brotmon.base.defense * defenseMultiplier))) /
              50 +
            2;

          const randomModifier =
            selfDamage !== 1 ? (Math.floor(Math.random() * (255 - 217 + 1)) + 217) / 255 : 1;

          selfDamage *= randomModifier;
          brotmon.current_hp = Math.floor(Math.max(0, brotmon.current_hp - selfDamage));

          result.interrupt = true;
          if (Math.random() < 1 / 2) {
            result.message = `${brotmon.base.name} derped out and hurt itself for ${Math.round(selfDamage)} damage in its brainrot!`;
          } else {
            result.message = `${brotmon.base.name} hurts itself for ${Math.round(selfDamage)} damage in its brainrot haze!`;
          }
        } else {
          result.message = `${brotmon.base.name} finally recovered its last two brain cells!`;
          removeEffect();
        }
      } else {
        result.message = `${brotmon.base.name} is no longer brainroted!`;
        removeEffect();
      }

      return result;
    },

    [StatusEffectEnum.SLEEP]: (
      brotmon: TurnBrotmon,
      effect: StatusEffect,
    ): InterruptiveEffectResult => {
      const result = {
        brotmon,
        interrupt: false,
      } as InterruptiveEffectResult;

      const removeEffect = () => {
        brotmon.effects = (brotmon.effects as StatusEffect[]).filter((e) => e.name !== effect.name);
      };

      if (effect.duration > 0) {
        effect.duration--;
        // 1/3 chance of waking up
        if (Math.random() < 1 / 3) {
          result.message = `${brotmon.base.name} woke up!`;
          removeEffect();
        } else {
          result.message = `${brotmon.base.name} is sleeping.`;
          result.interrupt = true;
        }
      } else {
        result.message = `${brotmon.base.name} woke up!`;
        removeEffect();
      }

      return result;
    },
  };

  static processInterruptiveEffects(brotmon: TurnBrotmon): {
    brotmon: TurnBrotmon;
    interrupt: {
      cause: StatusEffectEnum;
      message?: string;
    } | null;
  } {
    const result = { interrupt: null, brotmon };
    if (!brotmon.effects) return result;

    for (let effect of brotmon.effects as StatusEffect[]) {
      if (effect.type in this.handlers) {
        const handler = this.handlers[effect.type];
        const { interrupt, message, brotmon: returnBrotmon } = handler({ ...brotmon }, effect);

        if (interrupt) {
          return {
            brotmon: returnBrotmon,
            interrupt: {
              cause: effect.type,
              message,
            },
          };
        }
      }
    }

    return result;
  }

  static applyStatusEffect(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
    moveName: string,
  ) {
    const resultBrotmon = { ...brotmon };
    if (!resultBrotmon.effects) {
      resultBrotmon.effects = [] as StatusEffect[];
      return { message: null, brotmon: resultBrotmon };
    }

    const isBuffOrDebuffType = (type: StatusEffectEnum) =>
      type === StatusEffectEnum.BUFF || type === StatusEffectEnum.DEBUFF;

    const existingEffectIndex = (resultBrotmon.effects as StatusEffect[]).findIndex((e) =>
      isBuffOrDebuffType(e.type) ? effect.name === e.name : effect.type === e.type,
    );

    if (existingEffectIndex !== -1) {
      (resultBrotmon.effects as StatusEffect[])[existingEffectIndex].duration = effect.duration;
    } else {
      (resultBrotmon.effects as StatusEffect[]).push(effect);
    }

    return {
      message: `${resultBrotmon.base.name} was affected by ${effect.type.toLowerCase()} from ${moveName}!`,
      brotmon: resultBrotmon,
    };
  }
}
