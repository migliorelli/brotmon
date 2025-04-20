import { BattleUtils } from "@/lib/battle-utils";
import { StatusEffectHandler } from "@/lib/status-effect-handler";
import { createClient } from "@/lib/supabase/server";
import {
  BattleAction,
  BattleActionPayload,
  BattleTurn,
  Nature,
  TurnBrotmon,
} from "@/types/battle-service.types";
import { StatusEffect } from "@/types/status-effect.type";
import { ApiTrainer } from "@/types/trainer.type";

export class BattleService {
  private static instance: BattleService;
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabase: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabase;
  }

  public static async getInstance() {
    if (!BattleService.instance) {
      const supabase = await createClient();
      BattleService.instance = new BattleService(supabase);
    }
    return BattleService.instance;
  }

  private async logMessages(battle_id: string, turn_id: string, messages: string[]) {
    if (!battle_id || !turn_id || !messages || messages.length === 0) {
      return { error: "Missing required parameters for logMessages" };
    }

    try {
      // batch insert all logs at once
      const logs = messages.map((message) => ({
        battle_id,
        turn_id,
        message,
      }));

      const { error } = await this.supabase.from("battle_logs").insert(logs);

      if (error) {
        console.error("Error logging messages:", error.message);
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      console.error("Exception in logMessages:", err);
      return { error: err.message };
    }
  }

  private async logMessage(battle_id: string, turn_id: string, message: string) {
    return this.logMessages(battle_id, turn_id, [message]);
  }

  public async createTrainer(trainer: ApiTrainer) {
    if (!trainer || !trainer.emoji || !trainer.username || !trainer.brotmons) {
      return { trainer_id: null, error: "Invalid trainer data" };
    }

    try {
      const { data: trainer_id, error } = await this.supabase.rpc("create_trainer", {
        p_emoji: trainer.emoji,
        p_username: trainer.username,
        p_brotmons_ids: trainer.brotmons,
      });

      if (error) {
        console.error("Error creating trainer:", error.message);
        return { trainer_id: null, error: error.message };
      }

      return { trainer_id, error: null };
    } catch (err: any) {
      console.error("Exception in createTrainer:", err);
      return { trainer_id: null, error: err.message };
    }
  }

  public async createBattle(trainer_id: string) {
    if (!trainer_id) {
      return { battle_id: null, error: "Trainer ID is required" };
    }

    try {
      const { data: battleId, error } = await this.supabase.rpc("create_battle", {
        p_host_id: trainer_id,
      });

      if (error) {
        console.error("Error creating battle:", error.message);
        return { battle_id: null, error: error.message };
      }

      return { battle_id: battleId, error: null };
    } catch (err: any) {
      console.error("Exception in createBattle:", err);
      return { battle_id: null, error: err.message };
    }
  }

  public async joinBattle(battle_id: string, guest_id: string) {
    if (!battle_id || !guest_id) {
      return { error: "Battle ID and Guest ID are required" };
    }

    try {
      const { error } = await this.supabase.rpc("join_battle", {
        p_guest_id: guest_id,
        p_battle_id: battle_id,
      });

      if (error) {
        console.error("Error joining battle:", error.message);
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      console.error("Exception in joinBattle:", err);
      return { error: err.message };
    }
  }

  public async startBattle(battle_id: string) {
    if (!battle_id) {
      return { battle_id: null, error: "Battle ID is required" };
    }

    try {
      const { error } = await this.supabase.rpc("start_battle", {
        p_battle_id: battle_id,
      });

      if (error !== null) {
        console.error("Error starting battle:", error.message);
        return { battle_id: null, error: error.message };
      }

      return { battle_id, error: null };
    } catch (err: any) {
      console.error("Exception in startBattle:", err);
      return { battle_id: null, error: err.message };
    }
  }

  private async getActionBattle(battle_id: string) {
    if (!battle_id) {
      return { battle: null, error: "Battle ID is required" };
    }

    try {
      const { data, error } = await this.supabase
        .from("battles")
        .select("state, guest_id, host_id")
        .eq("id", battle_id)
        .single();

      if (error !== null) {
        console.error("Error getting battle:", error.message);
        return { battle: null, error: error.message };
      }

      return { battle: data, error: null };
    } catch (err: any) {
      console.error("Exception in getActionBattle:", err);
      return { battle: null, error: err.message };
    }
  }

  private async getBattleTurn(battle_id: string) {
    if (!battle_id) {
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
        console.error("Error getting battle turn:", error.message);
        return { battleTurn: null, error: error.message };
      }

      return { battleTurn: data, error: null };
    } catch (err: any) {
      console.error("Exception in getBattleTurn:", err);
      return { battleTurn: null, error: err.message };
    }
  }

  private async finishBattle(battle_id: string, winner_id: string, forfeit = false) {
    if (!battle_id || !winner_id) {
      return { error: "Battle ID and Winner ID are required" };
    }

    try {
      const { data, error: updateError } = await this.supabase
        .from("battles")
        .update({
          state: "FINISHED",
          winner_id,
        })
        .eq("id", battle_id)
        .select(
          `
            host:trainers!host_id(id, username), 
            guest:trainers!guest_id(id, username),
            turns:battle_turns(id)
          `,
        )
        .order("turns", { referencedTable: "battle_turns", ascending: false })
        .single();

      if (updateError) {
        console.error("Error updating battle state:", updateError.message);
        return { error: updateError.message };
      }

      if (!data.turns || !data.turns.length) {
        return { error: "No turns found for battle" };
      }

      const turn_id = data.turns[0].id;
      const winner = winner_id === data.host.id ? data.host.username : data.guest!.username;
      const loser = winner_id === data.host.id ? data.guest!.username : data.host.username;

      const message = `${forfeit ? `${loser} forfeited. ` : ""}${winner} won!`;
      const { error: logError } = await this.logMessage(battle_id, turn_id, message);

      if (logError !== null) {
        console.error("Error logging finish message:", logError);
        return { error: logError };
      }

      return { error: null };
    } catch (err: any) {
      console.error("Exception in finishBattle:", err);
      return { error: err.message };
    }
  }

  private async handleSwitchAction(trainer_id: string, brotmon_id: string) {
    if (!trainer_id || !brotmon_id) {
      return { action: null, error: "Trainer ID and Brotmon ID are required" };
    }

    try {
      // update with the switch action based on trainer_id
      const { data: action, error } = await this.supabase
        .from("battle_actions")
        .update({
          action: "SWITCH",
          target_id: brotmon_id,
        })
        .eq("trainer_id", trainer_id)
        .select()
        .single();

      if (error) {
        console.error("Error updating action to switch:", error.message);
        return { action: null, error: error.message };
      }

      return { action, error: null };
    } catch (err: any) {
      console.error("Exception in handleSwitchAction:", err);
      return { action: null, error: err.message };
    }
  }

  private async handleMoveAction(trainer_id: string, move_id: string) {
    if (!trainer_id || !move_id) {
      return { action: null, error: "Trainer ID and Move ID are required" };
    }

    try {
      // update with the switch action based on trainer_id
      const { data: action, error } = await this.supabase
        .from("battle_actions")
        .update({
          action: "MOVE",
          target_id: move_id,
        })
        .eq("trainer_id", trainer_id)
        .select()
        .single();

      if (error) {
        console.error("Error updating action to move:", error.message);
        return { action: null, error: error.message };
      }

      return { action, error: null };
    } catch (err: any) {
      console.error("Exception in handleMoveAction:", err);
      return { action: null, error: err.message };
    }
  }

  private async handleSwitch(trainer_id: string, brotmon_id: string) {
    if (!trainer_id || !brotmon_id) {
      return { brotmon: null, error: "Trainer ID and Brotmon ID are required" };
    }

    try {
      const { data: trainerBrotmons, error: brotmonsError } = await this.supabase
        .from("trainer_brotmons")
        .select(
          `
            id, effects, current_hp,
            base:brotmons!brotmon_id(
              id, name, emoji, nature, hp, attack, defense, speed
          )`,
        )
        .eq("trainer_id", trainer_id)
        .neq("id", brotmon_id)
        .gt("current_hp", 0)
        .order("created_at", { ascending: true })
        .limit(1);

      if (brotmonsError) {
        console.error("Error fetching brotmons for switch:", brotmonsError.message);
        return { brotmon: null, error: brotmonsError.message };
      } else if (!trainerBrotmons || trainerBrotmons.length === 0) {
        return { brotmon: null, error: "No Brotmon alive" };
      }

      const brotmon = trainerBrotmons[0] as TurnBrotmon;
      return { brotmon, error: null };
    } catch (err: any) {
      console.error("Exception in handleSwitch:", err);
      return { brotmon: null, error: err.message };
    }
  }

  private async autoSwitchBrotmon(trainer_id: string) {
    if (!trainer_id) {
      return { error: "Trainer ID is required" };
    }

    try {
      const { data: trainer, error: brotmonsError } = await this.supabase
        .from("trainers")
        .select(
          `
            id, username,
            actions:battle_actions!trainer_id(id),
            brotmons:trainer_brotmons!trainer_id(
              id, current_hp,
              base:brotmons!brotmon_id(
                id, name
              )
            )`,
        )
        .eq("id", trainer_id)
        .filter("brotmons.current_hp", "gt", 0)
        .limit(1)
        .order("brotmons.created_at", { ascending: true })
        .single();

      if (brotmonsError) {
        console.error("Error auto-switching brotmon:", brotmonsError.message);
        return { error: brotmonsError.message };
      } else if (!trainer.brotmons || trainer.brotmons.length === 0) {
        return { error: "No Brotmon alive" };
      }

      // update the active brotmon for the trainer's action
      if (trainer.actions && trainer.actions.length > 0) {
        const { error: updateError } = await this.supabase
          .from("battle_actions")
          .update({
            brotmon_id: trainer.brotmons[0].id,
          })
          .eq("id", trainer.actions[0].id);

        if (updateError) {
          console.error("Error updating active brotmon:", updateError.message);
          return { error: updateError.message };
        }
      }

      return { error: null };
    } catch (err: any) {
      console.error("Exception in autoSwitchBrotmon:", err);
      return { error: err.message };
    }
  }

  private async getMove(brotmon_id: string, move_id: string) {
    if (!brotmon_id || !move_id) {
      return { move: null, error: "Brotmon ID and Move ID are required" };
    }

    try {
      const { data: moves, error: movesError } = await this.supabase
        .from("brotmon_moves")
        .select(
          `
            id, current_uses,
            base:moves!move_id(
              id, name, nature, type, power, accuracy, max_uses, always_crit, priority, effect
            )
          `,
        )
        .eq("id", move_id)
        .eq("trainer_brotmon_id", brotmon_id)
        .gt("current_uses", 0)
        .limit(1);

      if (movesError) {
        console.error("Error fetching move:", movesError.message);
        return { move: null, error: movesError.message };
      } else if (!moves || moves.length === 0) {
        return { move: null, error: "Usage limit reached" };
      }

      const move = moves[0];
      return { move, error: null };
    } catch (err: any) {
      console.error("Exception in getMove:", err);
      return { move: null, error: err.message };
    }
  }

  private async executeTurn(battleTurn: BattleTurn) {
    if (
      !battleTurn ||
      !battleTurn.host_action ||
      !battleTurn.guest_action ||
      !battleTurn.host_action.action ||
      !battleTurn.host_action.target_id ||
      !battleTurn.guest_action.action ||
      !battleTurn.guest_action.target_id
    ) {
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

    // get base speeds and apply multipliers
    const hostBaseSpeed = actions[0].brotmon.base.speed;
    const guestBaseSpeed = actions[1].brotmon.base.speed;

    // get host and guest speed multipliers
    const hostSpeedMultiplier = BattleUtils.getStatusMultiplier(
      "speed",
      actions[0].brotmon.effects as StatusEffect[],
    );
    const guestSpeedMultiplier = BattleUtils.getStatusMultiplier(
      "speed",
      actions[1].brotmon.effects as StatusEffect[],
    );

    // calculate effective speeds
    const hostEffectiveSpeed = hostBaseSpeed * hostSpeedMultiplier;
    const guestEffectiveSpeed = guestBaseSpeed * guestSpeedMultiplier;

    // determine who goes first (higher speed goes first)
    // if speeds are equal, use a random tiebreaker
    let first = 0; // host by default
    if (hostEffectiveSpeed < guestEffectiveSpeed) {
      first = 1; // guest goes first
    } else if (hostEffectiveSpeed === guestEffectiveSpeed) {
      // random tiebreaker for equal speeds
      first = Math.random() < 0.5 ? 0 : 1;
    }

    const willSwitch = actions.map((a) => a.action === "SWITCH");

    // handle switches first
    for (let i = 0; i < 2; i++) {
      if (!willSwitch[i]) continue;

      const action = actions[i];
      const opponent = actions[1 - i]; // [0,1] or [1,0]

      const { brotmon, error: switchError } = await this.handleSwitch(
        action.trainer.id,
        action.target_id!,
      );

      if (switchError === "No Brotmon alive") {
        return {
          result: {
            finished: true,
            winner_id: opponent.trainer.id,
            logs,
          },
          error: null,
        };
      } else if (switchError) {
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
      .filter((item) => item !== null) as { action: (typeof actions)[0]; index: number }[];

    // if we have no moves to process, skip this part
    if (moveActions.length > 0) {
      // array to keep track of move priorities (will be populated later)
      const priorities: number[] = new Array(moveActions.length).fill(0);

      // look up move priorities
      for (let i = 0; i < moveActions.length; i++) {
        const { action } = moveActions[i];

        // get move details to determine priority
        const { move } = await this.getMove(action.brotmon.id, action.target_id!);
        if (move?.base.priority) {
          priorities[i] = move.base.priority;
        }
      }

      // sort by priority (higher first), then by speed (higher first), then by original order as tiebreaker
      moveActions.sort((a, b) => {
        const priorityDiff =
          priorities[moveActions.indexOf(b)] - priorities[moveActions.indexOf(a)];
        if (priorityDiff !== 0) return priorityDiff;

        const speedA =
          actions[a.index].brotmon.base.speed *
          BattleUtils.getStatusMultiplier(
            "speed",
            actions[a.index].brotmon.effects as StatusEffect[],
          );

        const speedB =
          actions[b.index].brotmon.base.speed *
          BattleUtils.getStatusMultiplier(
            "speed",
            actions[b.index].brotmon.effects as StatusEffect[],
          );

        if (speedA !== speedB) return speedB - speedA;

        // if still tied, use the first/second order
        return a.index - b.index;
      });

      // process moves in priority+speed order
      for (const { action, index } of moveActions) {
        const attackerBrotmon = { ...action.brotmon };

        // handle interruptions (brainrot, paralysis and sleep)
        const { brotmon: updatedBrotmon, interrupt } =
          StatusEffectHandler.processInterruptiveEffects(attackerBrotmon as TurnBrotmon);

        // update brotmon after effects
        actions[index].brotmon = updatedBrotmon;

        if (interrupt) {
          if (interrupt.message) {
            logs.push(interrupt.message);
          }
          continue;
        }

        // get move details
        const { move, error: moveError } = await this.getMove(
          attackerBrotmon.id,
          action.target_id!,
        );

        if (moveError === "Usage limit reached") {
          logs.push(`${attackerBrotmon.base.name} can't use this move anymore!`);
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
        } catch (err: any) {
          console.error("Exception updating move usage:", err);
        }

        // check for accuracy
        const accuracyRoll = Math.random();
        if (move.base.accuracy < accuracyRoll) {
          logs.push(`${attackerBrotmon.base.name} tried ${move.base.name} but missed!`);
          continue;
        }

        // find target (opponent)
        const targetIndex = 1 - index; // if index is 0, target is 1; if index is 1, target is 0
        const targetAction = actions[targetIndex];
        const targetBrotmon = { ...targetAction.brotmon };

        // process different move types
        if (move.base.type === "ATTACK") {
          // get attack and defense modifiers from status effects
          const attackMultiplier = BattleUtils.getStatusMultiplier(
            "attack",
            attackerBrotmon.effects as StatusEffect[],
          );

          const defenseMultiplier = BattleUtils.getStatusMultiplier(
            "defense",
            targetBrotmon.effects as StatusEffect[],
          );

          // calculate damage considering STAB (Same Type Attack Bonus) and type effectiveness
          const [damage, isCritical] = BattleUtils.calculateDamage(
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
        } else if (move.base.type === "STATUS") {
          logs.push(
            `${attackerBrotmon.base.name} used ${move.base.name} on ${targetBrotmon.base.name}!`,
          );
        }

        // Apply status effects if the move has them and passes chance check
        if (move.base.effect) {
          const effect = move.base.effect as StatusEffect;
          const chanceRoll = Math.random();

          if (effect.chance >= chanceRoll) {
            const result = StatusEffectHandler.applyStatusEffect(
              targetBrotmon as TurnBrotmon,
              effect,
              move.base.name,
            );

            // update target with applied effect
            actions[targetIndex].brotmon = result.brotmon || targetBrotmon;

            // add status effect message to logs if exists
            if (result.message) {
              logs.push(result.message);
            }
          }
        }
      }
    }

    // check for fainted brotmons after all actions
    for (let i = 0; i < 2; i++) {
      const action = actions[i];

      // if Brotmon died
      if (action.brotmon.current_hp <= 0) {
        logs.push(`${action.brotmon.base.name} fainted!`);

        // try to auto-switch to another Brotmon
        const { error: switchError } = await this.autoSwitchBrotmon(action.trainer.id);

        if (switchError === "No Brotmon alive") {
          // End battle if no more Brotmons are available
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

  public async performAction(battle_id: string, trainer_id: string, data: BattleActionPayload) {
    if (!battle_id || !trainer_id || !data) {
      return { error: "Missing required parameters" };
    }

    try {
      const { battle, error: battleError } = await this.getActionBattle(battle_id);
      if (battleError !== null) return { error: battleError };
      if (!battle) return { error: "Battle not found" };
      if (!battle.guest_id) return { error: "Guest not found" };

      // handle START action for host
      if (
        data.action === BattleAction.START &&
        battle.state === "READY" &&
        trainer_id === battle.host_id
      ) {
        const { error: startError } = await this.startBattle(battle_id);
        if (startError) return { error: startError };
        return { error: null };
      }

      // verify if battle is in progress
      if (battle.state !== "BATTLEING")
        return { error: "Battle has not yet started or has already finished" };

      // verify if the trainer is part of this battle
      if (trainer_id !== battle.host_id && trainer_id !== battle.guest_id) {
        return { error: "Trainer is not part of this battle" };
      }

      if (data.action === BattleAction.FORFEIT) {
        const winner_id = trainer_id === battle.host_id ? battle.guest_id : battle.host_id;
        const { error: finishError } = await this.finishBattle(battle_id, winner_id, true);
        if (finishError) return { error: finishError };
        return { error: null };
      } else if (data.action === BattleAction.SWITCH) {
        if (!data.brotmon_id) {
          return { error: "Brotmon ID is required for SWITCH action" };
        }
        const { error: switchError } = await this.handleSwitchAction(trainer_id, data.brotmon_id);
        if (switchError) return { error: switchError };
      } else if (data.action === BattleAction.MOVE) {
        if (!data.move_id) {
          return { error: "Move ID is required for MOVE action" };
        }
        const { error: moveError } = await this.handleMoveAction(trainer_id, data.move_id);
        if (moveError) return { error: moveError };
      } else {
        return { error: "Invalid action" };
      }

      const { battleTurn, error: battleTurnError } = await this.getBattleTurn(battle_id);
      if (battleTurnError !== null) return { error: battleTurnError };
      if (!battleTurn) return { error: "Battle turn not found" };

      // check if both players have made their actions
      if (
        !battleTurn.host_action?.action ||
        !battleTurn.host_action?.target_id ||
        !battleTurn.guest_action?.action ||
        !battleTurn.guest_action?.target_id
      ) {
        return { error: null }; // return success but don't execute turn yet
      }

      const { result, error: executeError } = await this.executeTurn(battleTurn);

      if (executeError) {
        return { error: executeError };
      }

      if (!result) {
        return { error: `Turn ${battleTurn.id} execution failed` };
      }

      // log battle messages
      if (result.logs.length > 0) {
        const { error: logError } = await this.logMessages(battle_id, battleTurn.id, result.logs);
        if (logError) {
          console.error("Error logging messages:", logError);
          return { error: logError };
        }
      }

      if (result.finished && result.winner_id) {
        const { error } = await this.finishBattle(battle_id, result.winner_id);
        if (error) {
          return { error };
        }
      }

      if (result.actions) {
        const updates = result.actions.map((action) => ({
          id: action.brotmon.id,
          current_hp: action.brotmon.current_hp,
          effects: action.brotmon.effects,
        }));

        for (const update of updates) {
          const { error: updateError } = await this.supabase
            .from("trainer_brotmons")
            .update({
              current_hp: update.current_hp,
              effects: update.effects,
            })
            .eq("id", update.id);

          if (updateError) {
            console.error("Error updating brotmon state:", updateError.message);
            return { error: updateError.message };
          }
        }

        // complete current turn and create a new turn
        const { error: turnError } = await this.supabase
          .from("battle_turns")
          .update({ done: true })
          .eq("id", battleTurn.id);

        if (turnError) {
          console.error("Error completing turn:", turnError.message);
          return { error: turnError.message };
        }

        const { error: newTurnError } = await this.supabase.rpc("create_battle_turn", {
          p_battle_id: battle_id,
        });

        if (newTurnError) {
          console.error("Error creating new turn:", newTurnError.message);
          return { error: newTurnError.message };
        }
      }

      return { error: null };
    } catch (err: any) {
      console.error("Exception in performAction:", err);
      return { error: err.message };
    }
  }
}
