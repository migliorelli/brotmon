CREATE TABLE brotmon_moves (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  trainer_brotmon_id uuid NOT NULL,
  move_id uuid NOT NULL,
  
  current_uses integer NOT NULL,

  CONSTRAINT brotmon_moves_pkey PRIMARY KEY (id),
  CONSTRAINT brotmon_moves_move_id_fkey FOREIGN KEY (move_id) REFERENCES moves(id) ON DELETE CASCADE,
  CONSTRAINT brotmon_moves_trainer_brotmon_id_fkey FOREIGN KEY (trainer_brotmon_id) REFERENCES trainer_brotmons(id) ON DELETE CASCADE
);