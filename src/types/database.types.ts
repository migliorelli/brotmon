export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      battle_actions: {
        Row: {
          action: Database["public"]["Enums"]["action_type"] | null
          battle_id: string
          brotmon_id: string
          id: string
          target_id: string | null
          trainer_id: string
        }
        Insert: {
          action?: Database["public"]["Enums"]["action_type"] | null
          battle_id: string
          brotmon_id: string
          id?: string
          target_id?: string | null
          trainer_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["action_type"] | null
          battle_id?: string
          brotmon_id?: string
          id?: string
          target_id?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_actions_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_actions_brotmon_id_fkey"
            columns: ["brotmon_id"]
            isOneToOne: false
            referencedRelation: "trainer_brotmons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_actions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_logs: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          message: string
          turn_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          message: string
          turn_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          message?: string
          turn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_logs_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_logs_turn_id_fkey"
            columns: ["turn_id"]
            isOneToOne: false
            referencedRelation: "battle_turns"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_turns: {
        Row: {
          battle_id: string
          created_at: string
          done: boolean
          guest_action_id: string | null
          host_action_id: string | null
          id: string
          turn: number
          updated_at: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          done: boolean
          guest_action_id?: string | null
          host_action_id?: string | null
          id?: string
          turn: number
          updated_at?: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          done?: boolean
          guest_action_id?: string | null
          host_action_id?: string | null
          id?: string
          turn?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_turn_guest_action_id_fkey"
            columns: ["guest_action_id"]
            isOneToOne: false
            referencedRelation: "battle_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_turn_host_action_id_fkey"
            columns: ["host_action_id"]
            isOneToOne: false
            referencedRelation: "battle_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_turns_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
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
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          guest_id?: string | null
          host_id: string
          id?: string
          state?: Database["public"]["Enums"]["battle_state"]
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          guest_id?: string | null
          host_id?: string
          id?: string
          state?: Database["public"]["Enums"]["battle_state"]
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
          current_uses: number
          id: string
          move_id: string
          trainer_brotmon_id: string
        }
        Insert: {
          current_uses: number
          id?: string
          move_id: string
          trainer_brotmon_id: string
        }
        Update: {
          current_uses?: number
          id?: string
          move_id?: string
          trainer_brotmon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brotmon_moves_move_id_fkey"
            columns: ["move_id"]
            isOneToOne: false
            referencedRelation: "moves"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brotmon_moves_trainer_brotmon_id_fkey"
            columns: ["trainer_brotmon_id"]
            isOneToOne: false
            referencedRelation: "trainer_brotmons"
            referencedColumns: ["id"]
          },
        ]
      }
      brotmon_owned_moves: {
        Row: {
          brotmon_id: string
          created_at: string
          id: string
          move_id: string
        }
        Insert: {
          brotmon_id: string
          created_at?: string
          id?: string
          move_id: string
        }
        Update: {
          brotmon_id?: string
          created_at?: string
          id?: string
          move_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brotmon_owned_moves_brotmon_id_fkey"
            columns: ["brotmon_id"]
            isOneToOne: false
            referencedRelation: "brotmons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brotmon_owned_moves_move_id_fkey"
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
          accuracy: number
          always_crit: boolean
          created_at: string
          effect: Json | null
          id: string
          max_uses: number
          name: string
          nature: string
          power: number
          priority: number
          type: string
          updated_at: string
        }
        Insert: {
          accuracy?: number
          always_crit?: boolean
          created_at?: string
          effect?: Json | null
          id?: string
          max_uses?: number
          name: string
          nature: string
          power: number
          priority?: number
          type: string
          updated_at?: string
        }
        Update: {
          accuracy?: number
          always_crit?: boolean
          created_at?: string
          effect?: Json | null
          id?: string
          max_uses?: number
          name?: string
          nature?: string
          power?: number
          priority?: number
          type?: string
          updated_at?: string
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
      associate_moves_to_brotmon: {
        Args: { p_brotmon_name: string; p_move_names: string[] }
        Returns: undefined
      }
      create_action: {
        Args: {
          p_battle_id: string
          p_trainer_id: string
          p_brotmon_id: string
          p_target_id?: string
          p_action?: Database["public"]["Enums"]["action_type"]
        }
        Returns: string
      }
      create_battle: {
        Args: { p_host_id: string }
        Returns: string
      }
      create_battle_turn: {
        Args: { p_battle_id: string }
        Returns: undefined
      }
      create_trainer: {
        Args: { p_username: string; p_emoji: string; p_brotmons_ids: string[] }
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
      action_type: "SWITCH" | "MOVE"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_type: ["SWITCH", "MOVE"],
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

