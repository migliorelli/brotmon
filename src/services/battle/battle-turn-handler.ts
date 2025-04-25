import { StatusEffectHandler } from "@/services/battle/status-effect-handler";
import { BattleTurn, Nature, TurnBrotmon } from "@/types/battle-service.types";
import { Database } from "@/types/database.types";
import { StatusEffect, StatusEffectEnum } from "@/types/status-effect.type";
import { SupabaseClient } from "@supabase/supabase-js";
import { BattleActionHandlers } from "./battle-action-handlers";
import { BattleUtils } from "./battle-utils";

export class BattleTurnHandler {
  private statusEffectHandler = new StatusEffectHandler();
  private battleUtils = new BattleUtils();

  constructor(
    private supabase: SupabaseClient<Database>,
    private actionHandlers: BattleActionHandlers,
  ) {}

  async getBattleTurn(battle_id: string) {
    if (!battle_id) {
      console.error(`[BattleTurnHandler] Cannot get battle turn:`, {
        error: "Battle ID is required",
      });
      return { battleTurn: null, error: "Battle ID is required" };
    }

    try {
      const { data, error } = await this.supabase
        .from("battle_turns")
        .select(
          `
            id, battle_id, turn, done,
            host_action:battle_actions!host_action_id(
              id, action, target_id,
              trainer:trainers!trainer_id(
                id, username,
                brotmons:trainer_brotmons!trainer_id(
                  id, effects, current_hp,
                  base:brotmons!brotmon_id(
                    id, name, emoji, nature, hp, attack, defense, speed
                  )
                )
              ),
              brotmon:trainer_brotmons!brotmon_id(
                id, effects, current_hp,
                base:brotmons!brotmon_id(
                  id, name, emoji, nature, hp, attack, defense, speed
                )
              )
            ),
            guest_action:battle_actions!guest_action_id(
              id, action, target_id,
              trainer:trainers!trainer_id(
                id, username,
                brotmons:trainer_brotmons!trainer_id(
                  id, effects, current_hp,
                  base:brotmons!brotmon_id(
                    id, name, emoji, nature, hp, attack, defense, speed
                  )
                )
              ),
              brotmon:trainer_brotmons!brotmon_id(
                id, effects, current_hp,
                base:brotmons!brotmon_id(
                  id, name, emoji, nature, hp, attack, defense, speed
                )
              )
            )
        `,
        )
        .eq("battle_id", battle_id)
        .eq("done", false)
        .limit(1)
        .single<BattleTurn>();

      if (error !== null) {
        console.error(`[BattleTurnHandler] Error fetching battle turn:`, {
          battle_id,
          error: error.message,
        });
        return { battleTurn: null, error: error.message };
      }

      return { battleTurn: data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to get battle turn";
      console.error(`[BattleTurnHandler] Exception in getBattleTurn:`, {
        battle_id,
        error,
      });
      return { battleTurn: null, error };
    }
  }

  async executeTurn(battleTurn: BattleTurn) {
    if (
      !battleTurn ||
      !battleTurn.host_action ||
      !battleTurn.guest_action ||
      !battleTurn.host_action.action ||
      !battleTurn.host_action.target_id ||
      !battleTurn.guest_action.action ||
      !battleTurn.guest_action.target_id
    ) {
      console.error(`[BattleTurnHandler] Cannot execute turn:`, {
        battle_id: battleTurn?.battle_id,
        turn: battleTurn?.turn,
        error: "Turn is not ready",
      });
      return {
        result: null,
        error: `Turn ${battleTurn?.turn || "unknown"} is not ready yet`,
      };
    }

    // store logs and send after all actions
    const logs: string[] = [];

    // deep copy to avoid direct mutation
    const actions = [
      { ...battleTurn.host_action, brotmon: { ...battleTurn.host_action.brotmon } },
      { ...battleTurn.guest_action, brotmon: { ...battleTurn.guest_action.brotmon } },
    ];

    const willSwitch = actions.map((a) => a.action === "SWITCH");

    // handle switches first
    for (let i = 0; i < 2; i++) {
      if (!willSwitch[i]) continue;

      const action = actions[i];
      const { brotmon, error: switchError } = await this.actionHandlers.handleSwitch(
        action.trainer.id,
        action.target_id!,
      );

      if (switchError) {
        return { result: null, error: switchError };
      } else if (!brotmon) {
        return {
          result: null,
          error: `Brotmon with ID ${action.target_id!} not found.`,
        };
      }

      logs.push(`${action.trainer.username} switched to ${brotmon.base.name}!`);
      actions[i].brotmon = { ...brotmon }; // use a copy to avoid reference issues
    }

    // sort moves by priority first, then by speed
    const moveActions = actions
      .map((action, index) => {
        if (action.action !== "MOVE") {
          return null;
        }
        return { action, index };
      })
      .filter((item) => item !== null) as { index: number; action: (typeof actions)[number] }[];

    // if we have no moves to process, skip this part
    if (moveActions.length > 0) {
      // array to keep track of move priorities (will be populated later)
      const priorities: number[] = new Array(moveActions.length).fill(0);

      // look up move priorities
      for (let i = 0; i < moveActions.length; i++) {
        const { action } = moveActions[i];

        // get move details to determine priority
        const { move } = await this.actionHandlers.getMove(action.brotmon.id, action.target_id!);
        if (move?.base.priority) {
          priorities[i] = move.base.priority;
        }
      }

      // sort by priority (higher first), then by speed (higher first), then by original order as tiebreaker
      moveActions.sort((a, b) => {
        // try to sort by priority
        const priorityDiff =
          priorities[moveActions.indexOf(b)] - priorities[moveActions.indexOf(a)];
        if (priorityDiff !== 0) return priorityDiff;

        // try to sort by speed
        const speedA =
          actions[a.index].brotmon.base.speed *
          this.battleUtils.getStatusMultiplier(
            "speed",
            actions[a.index].brotmon.effects as StatusEffect[],
          );

        const speedB =
          actions[b.index].brotmon.base.speed *
          this.battleUtils.getStatusMultiplier(
            "speed",
            actions[b.index].brotmon.effects as StatusEffect[],
          );

        if (speedA !== speedB) return speedB - speedA;

        // if still tied, use the first/second order
        return a.index - b.index;
      });

      // process moves in priority+speed order
      for (const { action, index: attackerIndex } of moveActions) {
        const attackerBrotmon = { ...action.brotmon };

        // handle interruptions (brainrot, paralysis and sleep)
        const { brotmon: updatedBrotmon, interrupt } =
          this.statusEffectHandler.processInterruptiveEffects(attackerBrotmon);

        // update brotmon after effects
        actions[attackerIndex].brotmon = updatedBrotmon;

        if (interrupt) {
          if (interrupt.message) {
            logs.push(interrupt.message);
          }
          continue;
        }

        // get move details
        const { move, error: moveError } = await this.actionHandlers.getMove(
          attackerBrotmon.id,
          action.target_id!,
        );

        if (moveError === "Usage limit reached") {
          logs.push(`${attackerBrotmon.base.name} can't use the move ${move?.base.name} anymore!`);
          continue;
        } else if (moveError) {
          return { result: null, error: moveError };
        } else if (!move) {
          return {
            result: null,
            error: `Move with ID ${action.target_id!} not found.`,
          };
        }

        // update move usage count (won't go below 0)
        try {
          const newUses = Math.max(0, move.current_uses - 1);
          const { error: updateMoveError } = await this.supabase
            .from("brotmon_moves")
            .update({
              current_uses: newUses,
            })
            .eq("id", move.id);

          if (updateMoveError) {
            console.error("Error updating move usage:", updateMoveError.message);
          }
        } catch (err) {
          console.error("Exception updating move usage:", err);
        }

        // check for accuracy
        const accuracyRoll = Math.random();
        if (move.base.accuracy < accuracyRoll) {
          logs.push(`${attackerBrotmon.base.name} tried ${move.base.name} but missed!`);
          continue;
        }

        // find target (opponent)
        const targetIndex = 1 - attackerIndex; // if index is 0, target is 1; if index is 1, target is 0
        const targetAction = actions[targetIndex];
        const targetBrotmon = { ...targetAction.brotmon };

        // process different move types
        if (move.base.type === "ATTACK") {
          // get attack and defense modifiers from status effects
          const attackMultiplier = this.battleUtils.getStatusMultiplier(
            "attack",
            attackerBrotmon.effects as StatusEffect[],
          );

          const defenseMultiplier = this.battleUtils.getStatusMultiplier(
            "defense",
            targetBrotmon.effects as StatusEffect[],
          );

          // calculate damage considering STAB (Same Type Attack Bonus) and type effectiveness
          const [damage, isCritical] = this.battleUtils.calculateDamage(
            move.base.power,
            attackerBrotmon.base.attack * attackMultiplier,
            targetBrotmon.base.defense * defenseMultiplier,
            attackerBrotmon.base.nature.includes(move.base.nature as Nature), // STAB bonus
            move.base.nature as Nature,
            targetBrotmon.base.nature as Nature[],
            move.base.always_crit,
          );

          // update target HP (not below 0)
          targetBrotmon.current_hp = Math.max(0, targetBrotmon.current_hp - damage);

          // update target in actions array
          actions[targetIndex].brotmon = targetBrotmon;

          // log the attack result
          let damageMessage = `${attackerBrotmon.base.name} used ${move.base.name} on ${targetBrotmon.base.name} and dealt ${damage} damage!`;
          if (isCritical) damageMessage += " Critical hit!";
          logs.push(damageMessage);
        }

        // apply status effects if the move has them and passes chance check
        if (move.base.effect) {
          const effect = move.base.effect as StatusEffect;
          const chanceRoll = Math.random();

          if (effect.chance >= chanceRoll) {
            let statusTarget = targetBrotmon;
            let statusTargetIndex = targetIndex;

            if (effect.type === StatusEffectEnum.BUFF) {
              statusTarget = attackerBrotmon;
              statusTargetIndex = attackerIndex;
            }

            const result = this.statusEffectHandler.applyStatusEffect(
              statusTarget as TurnBrotmon,
              effect,
              move.base.name,
            );

            // update target with applied effect
            actions[statusTargetIndex].brotmon = result.brotmon || targetBrotmon;

            // add status effect message to logs if exists
            if (result.message) {
              logs.push(result.message);
            }
          }
        }
      }
    }

    // process damage status effects (burn, poison, etc)
    for (const action of actions) {
      const { brotmon, logs: statusLogs } = this.statusEffectHandler.processDamageEffect(
        action.brotmon,
      );

      action.brotmon = brotmon;
      for (const log of statusLogs) {
        logs.push(log);
      }
    }

    // check for fainted brotmons after all actions
    for (const [i, action] of actions.entries()) {
      // if Brotmon died
      if (action.brotmon.current_hp <= 0) {
        logs.push(`${action.brotmon.base.name} fainted!`);

        // try to auto-switch to another Brotmon
        const { brotmon, error: switchError } = await this.actionHandlers.autoSwitchBrotmon(
          action.trainer.id,
        );

        if (switchError === "No Brotmon alive") {
          // end battle if no more Brotmons are available
          return {
            result: {
              finished: true,
              winner_id: actions[1 - i].trainer.id,
              logs,
            },
            error: null,
          };
        } else if (switchError) {
          return { result: null, error: switchError };
        }

        action.brotmon = brotmon as TurnBrotmon;
      }
    }

    return {
      result: {
        actions,
        logs,
        finished: false,
      },
      error: null,
    };
  }
}
