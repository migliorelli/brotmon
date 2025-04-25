import { TurnBrotmon } from "@/types/battle-service.types";
import { Database } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export class BattleActionHandlers {
  constructor(private supabase: SupabaseClient<Database>) {}

  async handleSwitchAction(trainer_id: string, brotmon_id: string) {
    if (!trainer_id || !brotmon_id) {
      console.error(`[BattleActionHandlers] Cannot handle switch action:`, {
        trainer_id,
        brotmon_id,
        error: "Missing required parameters",
      });
      return { error: "Missing required parameters" };
    }

    try {
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
        console.error(`[BattleActionHandlers] Error handling switch action:`, {
          trainer_id,
          brotmon_id,
          error: error.message,
        });
        return { error: error.message };
      }

      return { action, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to execute switch action";
      console.error(`[BattleActionHandlers] Exception in handleSwitchAction:`, {
        error,
      });
      return { error };
    }
  }

  async handleMoveAction(trainer_id: string, move_id: string) {
    if (!trainer_id || !move_id) {
      console.error(`[BattleActionHandlers] Cannot handle move action:`, {
        trainer_id,
        move_id,
        error: "Missing required parameters",
      });
      return { error: "Missing required parameters" };
    }

    try {
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
        console.error(`[BattleActionHandlers] Error handling move action:`, {
          trainer_id,
          move_id,
          error: error.message,
        });
        return { error: error.message };
      }

      return { action, error: null };
    } catch (err) {
      console.error(`[BattleActionHandlers] Exception in handleMoveAction:`, {
        error: err instanceof Error ? err.message : "Failed to handle move action",
      });
      return { error: err instanceof Error ? err.message : "Failed to handle move action" };
    }
  }

  async handleSwitch(trainer_id: string, brotmon_id: string) {
    if (!trainer_id || !brotmon_id) {
      return { brotmon: null, error: "Trainer ID and Brotmon ID are required" };
    }

    try {
      const { data: brotmon, error: brotmonsError } = await this.supabase
        .from("trainer_brotmons")
        .select(
          `
            id, effects, current_hp,
            base:brotmons!brotmon_id(
              id, name, emoji, nature, hp, attack, defense, speed
          )`,
        )
        .eq("trainer_id", trainer_id)
        .eq("id", brotmon_id)
        .single<TurnBrotmon>();

      if (brotmonsError) {
        console.error(`[BattleActionHandlers] Error fetching brotmons for switch:`, {
          trainer_id,
          brotmon_id,
          error: brotmonsError.message,
        });
        return { brotmon: null, error: brotmonsError.message };
      }

      if (brotmon.current_hp <= 0) {
        return { brotmon: null, error: `Brotmon ${brotmon.base.name} cannot battle.` };
      }

      return { brotmon, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to switch Brotmon";
      console.error(`[BattleActionHandlers] Exception in handleSwitch:`, {
        error,
      });
      return { brotmon: null, error };
    }
  }

  async autoSwitchBrotmon(trainer_id: string) {
    if (!trainer_id) {
      return { brotmon: null, error: "Trainer ID is required" };
    }

    try {
      const { data: brotmons, error: brotmonsError } = await this.supabase
        .from("trainer_brotmons")
        .select(
          `
          id, effects, current_hp,
          base:brotmons!brotmon_id(
            id, name, emoji, nature, hp, attack, defense, speed
          )
          `,
        )
        .eq("trainer_id", trainer_id)
        .gt("current_hp", 0)
        .order("created_at", { ascending: true })
        .limit(1);

      if (brotmonsError) {
        console.error(`[BattleActionHandlers] Error auto-switching brotmon:`, {
          trainer_id,
          error: brotmonsError.message,
        });
        return { brotmon: null, error: brotmonsError.message };
      } else if (!brotmons || brotmons.length === 0) {
        return { brotmon: null, error: "No Brotmon alive" };
      }

      return { brotmon: brotmons[0], error: null };
    } catch (err) {
      console.error(`[BattleActionHandlers] Exception in autoSwitchBrotmon:`, {
        error: err instanceof Error ? err.message : "Failed to auto switch brotmon",
      });
      return {
        brotmon: null,
        error: err instanceof Error ? err.message : "Failed to auto switch brotmon",
      };
    }
  }

  async getMove(brotmon_id: string, move_id: string) {
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
        console.error(`[BattleActionHandlers] Error fetching move:`, {
          brotmon_id,
          move_id,
          error: movesError.message,
        });
        return { move: null, error: movesError.message };
      }
      if (!moves || moves.length === 0) {
        return { move: moves[0], error: "Usage limit reached" };
      }

      const move = moves[0];
      return { move, error: null };
    } catch (err) {
      console.error(`[BattleActionHandlers] Exception in getMove:`, {
        error: err instanceof Error ? err.message : "Failed to get move",
      });
      return { move: null, error: err instanceof Error ? err.message : "Failed to get move" };
    }
  }
}
