import { createClient } from "@/lib/supabase/server";
import { BattleAction, BattleActionPayload } from "@/types/battle.type";
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

  private async handleSwitch() {}

  private async executeTurn() {}

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
        this.handleSwitch();
        break;

      case BattleAction.MOVE:
        this.executeTurn();
        break;

      default:
        return { error: "Invalid action" };
    }

    return { error: null };
  }
}
