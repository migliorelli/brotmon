import { BattleUtils } from "@/lib/battle-utils";
import { createClient } from "@/lib/supabase/server";
import { BattleAction, BattleActionPayload } from "@/types/battle.type";
import { Nature } from "@/types/brotmon.type";
import { StatusEffect } from "@/types/move.type";
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

  private async logMessage(
    battle_id: string,
    turn_id: string,
    message: string,
  ) {
    const { error } = await this.supabase.from("battle_logs").insert({
      battle_id,
      turn_id,
      message,
    });

    if (error) {
      console.error(error.message);
      return { error: error.message };
    }

    return { error: null };
  }

  public async createTrainer(trainer: ApiTrainer) {
    const { data: trainer_id, error } = await this.supabase.rpc(
      "create_trainer",
      {
        p_emoji: trainer.emoji,
        p_username: trainer.username,
        p_brotmons_json: JSON.stringify(trainer.brotmons),
      },
    );

    if (error) {
      console.error(error.message);
      return { trainer_id: null, error: error.message };
    }

    return { trainer_id, error: null };
  }

  public async createBattle(trainer_id: string) {
    const { data: battleId, error } = await this.supabase.rpc("create_battle", {
      p_host_id: trainer_id,
    });

    if (error) {
      console.error(error.message);
      return { battle_id: null, error: error.message };
    }

    return { battle_id: battleId, error: null };
  }

  public async joinBattle(battle_id: string, guest_id: string) {
    const { error } = await this.supabase.rpc("join_battle", {
      p_guest_id: guest_id,
      p_battle_id: battle_id,
    });

    if (error) {
      console.error(error.message);
      return { error: error.message };
    }

    return { error: null };
  }

  public async startBattle(battle_id: string) {
    const { error } = await this.supabase.rpc("start_battle", {
      p_battle_id: battle_id,
    });

    if (error !== null) {
      console.error(error.message);
      return { battle_id: null, error: error.message };
    }

    return { battle_id, error: null };
  }

  private async getActionBattle(battle_id: string) {
    const { data, error } = await this.supabase
      .from("battles")
      .select("state, guest_id, host_id")
      .eq("id", battle_id)
      .single();

    if (error !== null) return { battle: null, error: error.message };
    return { battle: data, error: null };
  }

  private async getBattleTurn(battle_id: string) {
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
      .limit(1)
      .single();

    if (error !== null) {
      console.error(error.message);
      return { battleTurn: null, error: error.message };
    }

    return { battleTurn: data, error: null };
  }

  private async finishBattle(
    battle_id: string,
    winner_id: string,
    forfeit = false,
  ) {
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
      console.error(updateError.message);
      return { error: updateError.message };
    }

    const turn_id = data.turns[0].id;
    const winner =
      winner_id === data.host.id ? data.host.username : data.guest!.username;
    const loser =
      winner_id === data.host.id ? data.guest!.username : data.host.username;

    const message = `${forfeit ? `${loser} forfeited. ` : ""}${winner} won!`;
    const { error: logError } = await this.logMessage(
      battle_id,
      turn_id,
      message,
    );

    if (logError !== null) {
      console.error(logError);
      return { error: logError };
    }

    return { error: null };
  }

  private async handleSwitchAction(trainer_id: string, brotmon_id: string) {}

  private async handleMoveAction(trainer_id: string, move_id: string) {}

  private async handleSwitch(trainer_id: string, brotmon_id: string) {
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
      return { brotmon: null, error: brotmonsError.message };
    } else if (trainerBrotmons.length === 0) {
      return { brotmon: null, error: "No Brotmon alive" };
    }

    const brotmon = trainerBrotmons[0];
    return { brotmon, error: null };
  }

  private async autoSwitchBrotmon(trainer_id: string) {
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
      return { error: brotmonsError.message };
    } else if (trainer.brotmons.length === 0) {
      return { error: "No Brotmon alive" };
    }

    return { error: null };
  }

  private async getMove(brotmon_id: string, move_id: string) {
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
      .eq("brotmon_id", brotmon_id)
      .gt("current_uses", 0)
      .limit(1);

    if (movesError) {
      return { move: null, error: movesError.message };
    } else if (moves.length === 0) {
      return { move: null, error: "Usage limit reached" };
    }

    const move = moves[0];
    return { move, error: null };
  }

  private async executeTurn(
    battleTurn: NonNullable<
      Awaited<ReturnType<typeof this.getBattleTurn>>["battleTurn"]
    >,
  ) {
    if (
      battleTurn.host_action === null ||
      battleTurn.guest_action === null ||
      battleTurn.host_action.action === null ||
      battleTurn.host_action.target_id === null ||
      battleTurn.guest_action.action === null ||
      battleTurn.guest_action.target_id === null
    ) {
      return {
        result: null,
        error: `Turn ${battleTurn.turn} is not ready yet`,
      };
    }

    // store logs and send after all actions
    const logs: string[] = [];

    // copy
    const actions = [
      { ...battleTurn.host_action },
      { ...battleTurn.guest_action },
    ];

    const hostSpeed = actions[0].brotmon.base.speed;
    const guestSpeed = actions[1].brotmon.base.speed;

    // get host speed multipliers (hsm)
    const hsm = BattleUtils.getStatusMultiplier(
      "speed",
      actions[0].brotmon.effects as StatusEffect[],
    );

    // get guest speed multipliers (hsm)
    const gsm = BattleUtils.getStatusMultiplier(
      "speed",
      actions[0].brotmon.effects as StatusEffect[],
    );

    // if hostSpeed < guestSpeed then Number(boolean) will be 1, the guest index
    const first = Number(hostSpeed * hsm < guestSpeed * gsm);

    const willSwitch = actions.map((a) => a.action === "SWITCH");

    for (let i = 0; i < 2; i++) {
      const ws = willSwitch[i];
      if (!ws) continue;
      const action = actions[i];
      const action2 = actions[1 - i]; // [0,1] === [0,-1]

      const { brotmon, error: switchError } = await this.handleSwitch(
        action.trainer.id,
        action.target_id!,
      );

      if (switchError === "No Brotmon alive") {
        return {
          result: {
            finished: true,
            winner_id: action2.trainer.id,
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

      actions[i].brotmon = brotmon;
    }

    for (let i = 0; i < 2; i++) {
      const attackerIndex = (first + i) % 2; // always return 0 | 1, starting with first
      const attacker = actions[attackerIndex];

      if (attacker.action === "SWITCH") continue;

      const attackerBrotmon = attacker.brotmon;

      const { brotmon: ieBrotmon, interrupt } =
        BattleUtils.handleInterruptiveEffects(attackerBrotmon);
      actions[attackerIndex].brotmon = ieBrotmon;

      if (interrupt) {
        if (interrupt.message) {
          logs.push(interrupt.message);
        }

        continue;
      }

      const { move, error: moveError } = await this.getMove(
        attackerBrotmon.id,
        attacker.target_id!,
      );

      if (moveError === "Usage limit reached") {
        return {
          result: null,
          error: `Move with ID ${attacker.target_id!} can'be used: limit of uses reached`,
        };
      } else if (moveError) {
        return { result: null, error: moveError };
      } else if (!move) {
        return {
          result: null,
          error: `Move with ID ${attacker.target_id!} not found.`,
        };
      }

      if (move.base.accuracy > Math.random()) {
        logs.push(`${attackerBrotmon.base.name} missed ${move.base.name}!`);
        continue;
      }

      const target = actions[1 - attackerIndex]; // [0,1] === [0,-1]
      const targetBrotmon = target.brotmon;

      if (move.base.type === "ATTACK") {
        const attackerMultiplier = BattleUtils.getStatusMultiplier(
          "attack",
          attackerBrotmon.effects as StatusEffect[],
        );

        const defenseMultiplier = BattleUtils.getStatusMultiplier(
          "defense",
          targetBrotmon.effects as StatusEffect[],
        );

        const damage = BattleUtils.calculateDamage(
          move.base.power,
          attackerBrotmon.base.attack * attackerMultiplier,
          targetBrotmon.base.defense * defenseMultiplier,
          attackerBrotmon.base.nature.includes(move.base.nature),
          move.base.nature as Nature,
          targetBrotmon.base.nature as Nature[],
        );

        targetBrotmon.current_hp = Math.floor(
          Math.max(0, targetBrotmon.current_hp - damage),
        );

        logs.push(
          `${attackerBrotmon.base.name} used ${move.base.name} on ${targetBrotmon.base.name} and dealt ${damage} damage!`,
        );
      }

      // apply or extend effect if it hits
      if (
        move.base.effect &&
        (move.base.effect as StatusEffect).chance <= Math.random()
      ) {
        const effect = move.base.effect as StatusEffect;
        BattleUtils.applyStatusEffect(targetBrotmon, effect, move.base.name);
      }
    }

    for (let i = 0; i < 2; i++) {
      const action = actions[i];

      if (action.brotmon.current_hp === 0) {
        logs.push(`${action.brotmon.base.name} fainted!`);
        const { error: asbError } = await this.autoSwitchBrotmon(
          action.trainer.id,
        );

        if (asbError === "No Brotmon alive") {
          return {
            result: {
              finished: true,
              winner_id: actions[1 - i].trainer.id, // [0,1] === [0,-1],
              logs,
            },
            error: null,
          };
        } else if (asbError) {
          return { result: null, error: asbError };
        }
      }
    }

    return { result: { actions, logs }, error: null };
  }

  public async performAction(
    battle_id: string,
    trainer_id: string,
    data: BattleActionPayload,
  ) {
    const { battle, error: battleError } =
      await this.getActionBattle(battle_id);
    if (battleError !== null) return { error: battleError };
    if (!battle.guest_id) return { error: "Guest not found" };

    if (
      BattleAction.START === data.action &&
      battle.state === "READY" &&
      trainer_id === battle.host_id
    ) {
      this.startBattle(battle_id);
      return { error: null };
    }

    if (battle.state !== "BATTLEING")
      return { error: "Battle has not yet started or has already finished" };

    switch (data.action) {
      case BattleAction.FORFEIT:
        const winner_id =
          trainer_id === battle.host_id ? battle.host_id : battle.guest_id;
        const { error: finishError } = await this.finishBattle(
          battle_id,
          winner_id,
          true,
        );

        if (finishError !== null) return { error: finishError };
        return { error: null };

      case BattleAction.SWITCH:
        this.handleSwitchAction(trainer_id, data.brotmon_id);
        break;

      case BattleAction.MOVE:
        this.handleMoveAction(trainer_id, data.move_id);
        break;

      default:
        return { error: "Invalid action" };
    }

    const { battleTurn, error: battleTurnError } =
      await this.getBattleTurn(battle_id);
    if (battleTurnError !== null) return { error: battleTurnError };

    const { result, error: executeError } = await this.executeTurn(battleTurn);

    if (executeError) {
      return { error: executeError };
    } else if (!result) {
      return { error: `Turn ${battleTurn.id} is not ready yet` };
    }

    for (let log of result.logs) {
      const { error: logError } = await this.logMessage(
        battle_id,
        battleTurn.id,
        log,
      );

      if (logError) {
        console.error(logError);
        return { error: logError };
      }
    }

    if (result.finished) {
      const { error } = await this.finishBattle(battle_id, result.winner_id);
      if (error) {
        return {
          error,
        };
      }
    } else if (result.actions) {
    }

    return { error: null };
  }
}
