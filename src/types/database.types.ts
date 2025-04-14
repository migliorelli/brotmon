export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      battle_logs: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          message: string
          turn: number
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          message: string
          turn: number
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          message?: string
          turn?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_logs_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_states: {
        Row: {
          action: string | null
          battle_id: string
          brotmon_id: string
          id: string
          move_id: string | null
          trainer_id: string
        }
        Insert: {
          action?: string | null
          battle_id: string
          brotmon_id: string
          id?: string
          move_id?: string | null
          trainer_id: string
        }
        Update: {
          action?: string | null
          battle_id?: string
          brotmon_id?: string
          id?: string
          move_id?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_states_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_states_brotmon_id_fkey"
            columns: ["brotmon_id"]
            isOneToOne: false
            referencedRelation: "trainer_brotmons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_states_move_id_fkey"
            columns: ["move_id"]
            isOneToOne: false
            referencedRelation: "brotmon_moves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_states_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      battles: {
        Row: {
          created_at: string
          guest_id: string | null
          host_id: string
          id: string
          state: Database["public"]["Enums"]["battle_state"]
          turn: number
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          guest_id?: string | null
          host_id: string
          id?: string
          state?: Database["public"]["Enums"]["battle_state"]
          turn?: number
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          guest_id?: string | null
          host_id?: string
          id?: string
          state?: Database["public"]["Enums"]["battle_state"]
          turn?: number
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battles_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battles_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      brotmon_moves: {
        Row: {
          brotmon_id: string
          current_uses: number
          id: string
          move_id: string
        }
        Insert: {
          brotmon_id: string
          current_uses: number
          id?: string
          move_id: string
        }
        Update: {
          brotmon_id?: string
          current_uses?: number
          id?: string
          move_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brotmon_moves_brotmon_id_fkey"
            columns: ["brotmon_id"]
            isOneToOne: false
            referencedRelation: "brotmons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brotmon_moves_move_id_fkey"
            columns: ["move_id"]
            isOneToOne: false
            referencedRelation: "moves"
            referencedColumns: ["id"]
          },
        ]
      }
      brotmons: {
        Row: {
          attack: number
          created_at: string
          defense: number
          emoji: string
          hp: number
          id: string
          name: string
          nature: string[]
          speed: number
        }
        Insert: {
          attack: number
          created_at?: string
          defense: number
          emoji: string
          hp: number
          id?: string
          name: string
          nature: string[]
          speed: number
        }
        Update: {
          attack?: number
          created_at?: string
          defense?: number
          emoji?: string
          hp?: number
          id?: string
          name?: string
          nature?: string[]
          speed?: number
        }
        Relationships: []
      }
      moves: {
        Row: {
          accuracy: number | null
          always_crit: boolean | null
          created_at: string
          effect: Json | null
          id: string
          name: string
          nature: string
          power: number
          priority: number | null
          type: string
          uses: number | null
        }
        Insert: {
          accuracy?: number | null
          always_crit?: boolean | null
          created_at?: string
          effect?: Json | null
          id?: string
          name: string
          nature: string
          power: number
          priority?: number | null
          type: string
          uses?: number | null
        }
        Update: {
          accuracy?: number | null
          always_crit?: boolean | null
          created_at?: string
          effect?: Json | null
          id?: string
          name?: string
          nature?: string
          power?: number
          priority?: number | null
          type?: string
          uses?: number | null
        }
        Relationships: []
      }
      trainer_brotmons: {
        Row: {
          brotmon_id: string
          created_at: string
          current_hp: number
          effects: Json[] | null
          id: string
          trainer_id: string
        }
        Insert: {
          brotmon_id: string
          created_at?: string
          current_hp: number
          effects?: Json[] | null
          id?: string
          trainer_id: string
        }
        Update: {
          brotmon_id?: string
          created_at?: string
          current_hp?: number
          effects?: Json[] | null
          id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_brotmons_brotmon_id_fkey"
            columns: ["brotmon_id"]
            isOneToOne: false
            referencedRelation: "brotmons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_brotmons_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          created_at: string
          emoji: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          username: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_battle: {
        Args: { p_host_id: string }
        Returns: string
      }
      create_trainer: {
        Args: { p_username: string; p_emoji: string; p_brotmons_json: Json }
        Returns: string
      }
      join_battle: {
        Args: { p_guest_id: string; p_battle_id: string }
        Returns: undefined
      }
      start_battle: {
        Args: { p_battle_id: string }
        Returns: undefined
      }
    }
    Enums: {
      battle_state: "WAITING" | "BATTLEING" | "FINISHED" | "READY"
      move_type: "ATTACK" | "STATUS"
      nature:
        | "NORMAL"
        | "FIGHTING"
        | "FIRE"
        | "WATER"
        | "GRASS"
        | "ELECTRIC"
        | "ICE"
        | "ROCK"
        | "GROUND"
        | "FLYING"
        | "BUG"
        | "POISON"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      battle_state: ["WAITING", "BATTLEING", "FINISHED", "READY"],
      move_type: ["ATTACK", "STATUS"],
      nature: [
        "NORMAL",
        "FIGHTING",
        "FIRE",
        "WATER",
        "GRASS",
        "ELECTRIC",
        "ICE",
        "ROCK",
        "GROUND",
        "FLYING",
        "BUG",
        "POISON",
      ],
    },
  },
} as const
