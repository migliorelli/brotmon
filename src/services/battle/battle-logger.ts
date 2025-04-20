import { Database } from "@/types/database.types";
import { SupabaseClient } from "@supabase/supabase-js";

export class BattleLogger {
  constructor(private supabase: SupabaseClient<Database>) {}

  async logMessages(battle_id: string, turn_id: string, messages: string[]) {
    if (!battle_id || !turn_id || !messages || messages.length === 0) {
      console.error(`[BattleLogger] Cannot log messages:`, {
        battle_id,
        turn_id,
        message_count: messages.length,
        error: "Missing required parameters"
      });
      return { error: "Missing required parameters" };
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
        console.error(`[BattleLogger] Error logging messages:`, {
          battle_id,
          turn_id,
          error: error.message
        });
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      console.error(`[BattleLogger] Exception in logMessages:`, {
        error: err.message
      });
      return { error: err.message };
    }
  }

  async logMessage(battle_id: string, turn_id: string, message: string) {
    if (!battle_id || !turn_id || !message) {
      console.error(`[BattleLogger] Cannot log message:`, {
        battle_id,
        turn_id,
        error: "Missing required parameters"
      });
      return { error: "Missing required parameters" };
    }

    try {
      const { error } = await this.supabase
        .from("battle_logs")
        .insert({ battle_id, turn_id, message });

      if (error) {
        console.error(`[BattleLogger] Error logging message:`, {
          battle_id,
          turn_id,
          error: error.message
        });
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      console.error(`[BattleLogger] Exception in logMessage:`, {
        error: err.message
      });
      return { error: err.message };
    }
  }
}
