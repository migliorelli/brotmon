CREATE TABLE battle_actions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  battle_id uuid NOT NULL,
  trainer_id uuid NOT NULL,
  brotmon_id uuid NOT NULL,
  
  action action_type,
  target_id uuid,

  CONSTRAINT battle_actions_pkey PRIMARY KEY (id),
  CONSTRAINT battle_actions_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
  CONSTRAINT battle_actions_brotmon_id_fkey FOREIGN KEY (brotmon_id) REFERENCES trainer_brotmons(id),
  CONSTRAINT battle_actions_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);