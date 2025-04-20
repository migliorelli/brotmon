import { BattleAction, BattleActionPayload } from "@/types/battle-service.types";
import { Database } from "@/types/database.types";
import { ApiTrainer } from "@/types/trainer.type";
import { SupabaseClient } from "@supabase/supabase-js";
import { BattleActionHandlers } from "./battle/battle-action-handlers";
import { BattleLogger } from "./battle/battle-logger";
import { BattleTurnHandler } from "./battle/battle-turn-handler";

export class BattleService {
  private actionHandlers: BattleActionHandlers;
  private logger: BattleLogger;
  private turnHandler: BattleTurnHandler;
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>) {
    this.actionHandlers = new BattleActionHandlers(supabase);
    this.logger = new BattleLogger(supabase);
    this.turnHandler = new BattleTurnHandler(supabase, this.actionHandlers);
    this.supabase = supabase;
  }

  async createTrainer(trainer: ApiTrainer) {
    if (!trainer || !trainer.emoji || !trainer.username || !trainer.brotmons) {
      console.error(`[BattleService] Cannot create trainer:`, {
        error: "Invalid trainer data",
        trainer,
      });
      return { trainer_id: null, error: "Invalid trainer data" };
    }

    try {
      const { data: trainer_id, error } = await this.supabase.rpc("create_trainer", {
        p_emoji: trainer.emoji,
        p_username: trainer.username,
        p_brotmons_ids: trainer.brotmons,
      });

      if (error) {
        console.error(`[BattleService] Error creating trainer:`, {
          username: trainer.username,
          error: error.message,
        });
        return { trainer_id: null, error: error.message };
      }

      return { trainer_id, error: null };
    } catch (err) {
      console.error(`[BattleService] Exception in createTrainer:`, {
        error: err instanceof Error ? err.message : "Failed to create trainer",
      });
      return { trainer_id: null, error: err instanceof Error ? err.message : "Failed to create trainer" };
    }
  }

  async createBattle(trainer_id: string) {
    if (!trainer_id) {
      console.error(`[BattleService] Cannot create battle:`, {
        error: "Trainer ID is required",
      });
      return { battle_id: null, error: "Trainer ID is required" };
    }

    try {
      const { data: battleId, error } = await this.supabase.rpc("create_battle", {
        p_host_id: trainer_id,
      });

      if (error) {
        console.error(`[BattleService] Error creating battle:`, {
          trainer_id,
          error: error.message,
        });
        return { battle_id: null, error: error.message };
      }

      return { battle_id: battleId, error: null };
    } catch (err) {
      console.error(`[BattleService] Exception in createBattle:`, {
        error: err instanceof Error ? err.message : "Failed to create battle",
      });
      return { battle_id: null, error: err instanceof Error ? err.message : "Failed to create battle" };
    }
  }

  async joinBattle(battle_id: string, guest_id: string) {
    if (!battle_id || !guest_id) {
      console.error(`[BattleService] Cannot join battle:`, {
        battle_id,
        guest_id,
        error: "Battle ID and Guest ID are required",
      });
      return { error: "Battle ID and Guest ID are required" };
    }

    try {
      const { error } = await this.supabase.rpc("join_battle", {
        p_guest_id: guest_id,
        p_battle_id: battle_id,
      });

      if (error) {
        console.error(`[BattleService] Error joining battle:`, {
          battle_id,
          guest_id,
          error: error.message,
        });
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      console.error(`[BattleService] Exception in joinBattle:`, {
        error: err instanceof Error ? err.message : "Failed to join battle",
      });
      return { error: err instanceof Error ? err.message : "Failed to join battle" };
    }
  }

  async startBattle(battle_id: string) {
    if (!battle_id) {
      console.error(`[BattleService] Cannot start battle:`, {
        error: "Battle ID is required",
      });
      return { battle_id: null, error: "Battle ID is required" };
    }

    try {
      const { error } = await this.supabase.rpc("start_battle", {
        p_battle_id: battle_id,
      });

      if (error !== null) {
        console.error(`[BattleService] Error starting battle:`, {
          battle_id,
          error: error.message,
        });
        return { battle_id: null, error: error.message };
      }

      return { battle_id, error: null };
    } catch (err) {
      console.error(`[BattleService] Exception in startBattle:`, {
        error: err instanceof Error ? err.message : "Failed to start battle",
      });
      return { battle_id: null, error: err instanceof Error ? err.message : "Failed to start battle" };
    }
  }

  private async getActionBattle(battle_id: string) {
    if (!battle_id) {
      console.error(`[BattleService] Cannot get battle action:`, {
        error: "Battle ID is required",
      });
      return { battle: null, error: "Battle ID is required" };
    }

    try {
      const { data, error } = await this.supabase
        .from("battles")
        .select("state, guest_id, host_id")
        .eq("id", battle_id)
        .single();

      if (error) {
        console.error(`[BattleService] Error getting battle:`, {
          battle_id,
          error: error.message,
        });
        return { battle: null, error: error.message };
      }

      return { battle: data, error: null };
    } catch (err) {
      console.error(`[BattleService] Exception in getActionBattle:`, {
        error: err instanceof Error ? err.message : "Failed to get battle action",
      });
      return { battle: null, error: err instanceof Error ? err.message : "Failed to get battle action" };
    }
  }

  private async finishBattle(battle_id: string, winner_id: string, forfeit = false) {
    if (!battle_id || !winner_id) {
      console.error(`[BattleService] Cannot finish battle:`, {
        battle_id,
        winner_id,
        error: "Battle ID and Winner ID are required",
      });
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
        console.error(`[BattleService] Error updating battle state:`, {
          battle_id,
          winner_id,
          error: updateError.message,
        });
        return { error: updateError.message };
      }

      if (!data.turns || !data.turns.length) {
        console.error(`[BattleService] No turns found for battle:`, {
          battle_id,
        });
        return { error: "No turns found for battle" };
      }

      const turn_id = data.turns[0].id;
      const winner = winner_id === data.host.id ? data.host.username : data.guest!.username;
      const loser = winner_id === data.host.id ? data.guest!.username : data.host.username;

      const message = `${forfeit ? `${loser} forfeited. ` : ""}${winner} won!`;
      const { error: logError } = await this.logger.logMessage(battle_id, turn_id, message);

      if (logError !== null) {
        console.error(`[BattleService] Error logging finish message:`, {
          battle_id,
          turn_id,
          error: logError,
        });
        return { error: logError };
      }

      return { error: null };
    } catch (err) {
      console.error(`[BattleService] Exception in finishBattle:`, {
        error: err instanceof Error ? err.message : "Failed to finish battle",
      });
      return { error: err instanceof Error ? err.message : "Failed to finish battle" };
    }
  }

  async performAction(battle_id: string, trainer_id: string, data: BattleActionPayload) {
    if (!battle_id || !trainer_id || !data) {
      console.error(`[BattleService] Cannot perform action:`, {
        battle_id,
        trainer_id,
        action: data?.action,
        error: "Missing required parameters",
      });
      return { error: "Missing required parameters" };
    }

    try {
      const { battle, error: battleError } = await this.getActionBattle(battle_id);
      if (battleError !== null) {
        console.error(`[BattleService] Error getting battle for action:`, {
          battle_id,
          error: battleError,
        });
        return { error: battleError };
      }

      if (!battle.guest_id) {
        console.error(`[BattleService] Cannot perform action:`, {
          battle_id,
          error: "Guest not found",
        });
        return { error: "Guest not found" };
      }

      if (trainer_id !== battle.host_id && trainer_id !== battle.guest_id) {
        console.error(`[BattleService] Trainer is not part of this battle:`, {
          battle_id,
          trainer_id,
        });
        return { error: "Trainer is not part of this battle" };
      }

      if (
        data.action === BattleAction.START &&
        battle.state === "READY" &&
        trainer_id === battle.host_id
      ) {
        const { error: startError } = await this.startBattle(battle_id);
        if (startError) {
          console.error(`[BattleService] Error starting battle:`, {
            battle_id,
            error: startError,
          });
          return { error: startError };
        }
        return { error: null };
      }

      if (battle.state !== "BATTLEING") {
        console.error(`[BattleService] Battle has not yet started or has already finished:`, {
          battle_id,
          state: battle.state,
        });
        return { error: "Battle has not yet started or has already finished" };
      }

      switch (data.action) {
        case BattleAction.FORFEIT: {
          const winner_id = trainer_id === battle.host_id ? battle.guest_id : battle.host_id;
          const { error: finishError } = await this.finishBattle(battle_id, winner_id, true);
          if (finishError) {
            console.error(`[BattleService] Error finishing battle:`, {
              battle_id,
              winner_id,
              error: finishError,
            });
            return { error: finishError };
          }
          return { error: null };
        }

        case BattleAction.SWITCH: {
          if (!data.brotmon_id) {
            console.error(`[BattleService] Brotmon ID is required for SWITCH action:`, {
              battle_id,
              trainer_id,
            });
            return { error: "Brotmon ID is required for SWITCH action" };
          }
          const { error: switchError } = await this.actionHandlers.handleSwitchAction(
            trainer_id,
            data.brotmon_id,
          );

          if (switchError) {
            console.error(`[BattleService] Error handling SWITCH action:`, {
              battle_id,
              trainer_id,
              brotmon_id: data.brotmon_id,
              error: switchError,
            });
            return { error: switchError };
          }
          break;
        }

        case BattleAction.MOVE: {
          if (!data.move_id) {
            console.error(`[BattleService] Move ID is required for MOVE action:`, {
              battle_id,
              trainer_id,
            });
            return { error: "Move ID is required for MOVE action" };
          }

          const { error: moveError } = await this.actionHandlers.handleMoveAction(
            trainer_id,
            data.move_id,
          );

          if (moveError) {
            console.error(`[BattleService] Error handling MOVE action:`, {
              battle_id,
              trainer_id,
              move_id: data.move_id,
              error: moveError,
            });
            return { error: moveError };
          }
          break;
        }

        default:
          console.error(`[BattleService] Invalid action:`, {
            battle_id,
            trainer_id,
            action: data.action,
          });
          return { error: "Invalid action" };
      }

      const { battleTurn, error: battleTurnError } =
        await this.turnHandler.getBattleTurn(battle_id);
      if (battleTurnError !== null) {
        console.error(`[BattleService] Error getting battle turn:`, {
          battle_id,
          error: battleTurnError,
        });
        return { error: battleTurnError };
      }
      if (!battleTurn) {
        console.error(`[BattleService] Battle turn not found:`, {
          battle_id,
        });
        return { error: "Battle turn not found" };
      }

      if (
        !battleTurn.host_action?.action ||
        !battleTurn.host_action?.target_id ||
        !battleTurn.guest_action?.action ||
        !battleTurn.guest_action?.target_id
      ) {
        return { error: null };
      }

      const { result, error: executeError } = await this.turnHandler.executeTurn(battleTurn);

      if (executeError) {
        console.error(`[BattleService] Error executing turn:`, {
          battle_id,
          turn_id: battleTurn.id,
          error: executeError,
        });
        return { error: executeError };
      }

      if (!result) {
        console.error(`[BattleService] Turn execution failed:`, {
          battle_id,
          turn_id: battleTurn.id,
        });
        return { error: `Turn ${battleTurn.id} execution failed` };
      }

      if (result.logs.length > 0) {
        const { error: logError } = await this.logger.logMessages(
          battle_id,
          battleTurn.id,
          result.logs,
        );
        if (logError) {
          console.error(`[BattleService] Error logging battle messages:`, {
            battle_id,
            turn_id: battleTurn.id,
            error: logError,
          });
          return { error: logError };
        }
      }

      if (result.finished && result.winner_id) {
        const { error } = await this.finishBattle(battle_id, result.winner_id);
        if (error) {
          console.error(`[BattleService] Error finishing battle:`, {
            battle_id,
            winner_id: result.winner_id,
            error: error,
          });
          return { error };
        }
      }

      if (result.actions) {
        const updates = result.actions.map((action) => ({
          action_id: action.id,
          tb_id: action.brotmon.id,
          current_hp: action.brotmon.current_hp,
          effects: action.brotmon.effects,
        }));

        for (const update of updates) {
          const { error: updateAError } = await this.supabase
            .from("battle_actions")
            .update({ action: null, target_id: null })
            .eq("id", update.action_id);

          if (updateAError) {
            console.error(`[BattleService] Error updating action state:`, {
              battle_id,
              action_id: update.action_id,
              brotmon_id: update.tb_id,
              error: updateAError.message,
            });
            return { error: updateAError.message };
          }

          const { error: updateTBError } = await this.supabase
            .from("trainer_brotmons")
            .update({
              current_hp: update.current_hp,
              effects: update.effects,
            })
            .eq("id", update.tb_id);

          if (updateTBError) {
            console.error(`[BattleService] Error updating brotmon state:`, {
              battle_id,
              action_id: update.action_id,
              brotmon_id: update.tb_id,
              error: updateTBError.message,
            });
            return { error: updateTBError.message };
          }
        }

        const { error: turnError } = await this.supabase
          .from("battle_turns")
          .update({ done: true })
          .eq("id", battleTurn.id)
          .eq("done", false);

        if (turnError) {
          console.error(`[BattleService] Error completing turn:`, {
            battle_id,
            turn_id: battleTurn.id,
            error: turnError.message,
          });
          return { error: turnError.message };
        }

        const { error: newTurnError } = await this.supabase.rpc("create_battle_turn", {
          p_battle_id: battle_id,
        });

        if (newTurnError) {
          console.error(`[BattleService] Error creating new turn:`, {
            battle_id,
            error: newTurnError.message,
          });
          return { error: newTurnError.message };
        }
      }

      return { error: null };
    } catch (err) {
      console.error(`[BattleService] Exception in performAction:`, {
        error: err instanceof Error ? err.message : "Failed to perform action",
      });
      return { error: err instanceof Error ? err.message : "Failed to perform action" };
    }
  }
}
