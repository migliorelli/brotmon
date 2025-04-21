CREATE TABLE battle_turns (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  battle_id uuid NOT NULL,
  host_action_id uuid,
  guest_action_id uuid,

  turn integer NOT NULL,
  done boolean NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT battle_turn_pkey PRIMARY KEY (id),
  CONSTRAINT battle_turns_unique_turn_per_battle_id UNIQUE (battle_id, turn),
  CONSTRAINT battle_turns_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
  CONSTRAINT battle_turn_host_action_id_fkey FOREIGN KEY (host_action_id) REFERENCES battle_actions(id),
  CONSTRAINT battle_turn_guest_action_id_fkey FOREIGN KEY (guest_action_id) REFERENCES battle_actions(id)
);