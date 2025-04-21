CREATE TABLE battle_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  battle_id uuid NOT NULL,
  turn_id uuid NOT NULL,

  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT battle_logs_pkey PRIMARY KEY (id),
  CONSTRAINT battle_logs_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
  CONSTRAINT battle_logs_turn_id_fkey FOREIGN KEY (turn_id) REFERENCES battle_turns(id)
);