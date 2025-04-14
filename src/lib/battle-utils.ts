import { natureStrengths } from "@/data/nature";
import { BattleService } from "@/services/battle-service";
import { Nature } from "@/types/brotmon.type";
import { StatusEffect, StatusEffectEnum } from "@/types/move.type";

type TurnBrotmon = NonNullable<
  NonNullable<
    Awaited<
      ReturnType<(typeof BattleService)["instance"]["getBattleTurn"]>
    >["battleTurn"]
  >["host_action"]
>["brotmon"];

type InterruptiveEffectHandler = (
  brotmon: TurnBrotmon,
  effect: StatusEffect,
) => {
  interrupt: boolean;
  message?: string;
  brotmon: TurnBrotmon;
};

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
    const type1 = natureStrengths[moveNature].find((n) => n === targetNature[0]) ? 2 : 1; // prettier-ignore
    const type2 = natureStrengths[moveNature].find((n) => n === targetNature[1]) ? 2 : 1; // prettier-ignore
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

  public static handleBrainrot(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
  ): ReturnType<InterruptiveEffectHandler> {
    const result = {
      brotmon,
      interrupt: false,
    } as ReturnType<InterruptiveEffectHandler>;

    const removeEffect = () => {
      brotmon.effects = (brotmon.effects as StatusEffect[]).filter(
        (e) => e.name !== effect.name,
      );
    };

    if (effect.duration > 0) {
      effect.duration--;
      // 1/2 chance of self damage
      if (Math.random() < 1 / 2) {
        const attackMultiplier = this.getStatusMultiplier(
          "attack",
          brotmon.effects as StatusEffect[],
        );

        const defenseMultiplier = this.getStatusMultiplier(
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
          selfDamage !== 1
            ? (Math.floor(Math.random() * (255 - 217 + 1)) + 217) / 255
            : 1;

        selfDamage *= randomModifier;
        brotmon.current_hp = Math.floor(
          Math.max(0, brotmon.current_hp - selfDamage),
        );

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
  }

  public static handleSleep(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
  ): ReturnType<InterruptiveEffectHandler> {
    const result = {
      brotmon,
      interrupt: false,
    } as ReturnType<InterruptiveEffectHandler>;

    const removeEffect = () => {
      brotmon.effects = (brotmon.effects as StatusEffect[]).filter(
        (e) => e.name !== effect.name,
      );
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
  }

  public static handleParalysis(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
  ): ReturnType<InterruptiveEffectHandler> {
    const result = {
      brotmon,
      interrupt: false,
    } as ReturnType<InterruptiveEffectHandler>;

    const removeEffect = () => {
      brotmon.effects = (brotmon.effects as StatusEffect[]).filter(
        (e) => e.name !== effect.name,
      );
    };

    if (effect.duration > 0) {
      effect.duration--;
      // 1/4 chance of being paralyzed
      if (Math.random() > 1 / 4) {
        result.message = `${brotmon.base.name} is paralyzed! It can't move!`;
        result.interrupt = true;
      }
    } else {
      result.message = `${brotmon.base.name} is no longer paralyzed!`;
      removeEffect();
    }

    return result;
  }
  // message: `${brotmon.base.name} is paralyzed! It can't move!`,

  public static handleInterruptiveEffects(brotmon: TurnBrotmon): {
    brotmon: TurnBrotmon;
    interrupt: {
      cause: StatusEffectEnum;
      message?: string;
    } | null;
  } {
    const result = { interrupt: null, brotmon };
    if (!brotmon.effects) return result;

    const handlers: Partial<
      Record<StatusEffectEnum, InterruptiveEffectHandler>
    > = {
      [StatusEffectEnum.PARALYZE]: this.handleParalysis,
      [StatusEffectEnum.BRAINROT]: this.handleBrainrot,
      [StatusEffectEnum.SLEEP]: this.handleSleep,
    };

    for (let effect of brotmon.effects as StatusEffect[]) {
      if (effect.type in handlers) {
        const handler = handlers[effect.type]!;
        const {
          interrupt,
          message,
          brotmon: returnBrotmon,
        } = handler(brotmon, effect);

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

  public static applyStatusEffect(
    brotmon: TurnBrotmon,
    effect: StatusEffect,
    moveName: string,
  ) {
    if (!brotmon.effects) {
      brotmon.effects = [] as StatusEffect[];
      return { message: null };
    }

    const isBuffOrDebuffType = (type: StatusEffectEnum) =>
      type === StatusEffectEnum.BUFF || type === StatusEffectEnum.DEBUFF;

    const existingEffectIndex = (brotmon.effects as StatusEffect[]).findIndex(
      (e) =>
        isBuffOrDebuffType(e.type)
          ? effect.name === e.name
          : effect.type === e.type,
    );

    const result = {
      message: `${brotmon.base.name} was affected by ${effect.type.toLowerCase()} from ${moveName}!`,
    };

    if (existingEffectIndex !== -1) {
      (brotmon.effects as StatusEffect[])[existingEffectIndex].duration =
        effect.duration;
      return result;
    }

    (brotmon.effects as StatusEffect[]).push(effect);
    return result;
  }
}
