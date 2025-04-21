CREATE TABLE brotmon_owned_moves (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  brotmon_id uuid NOT NULL,
  move_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT brotmon_owned_moves_pkey PRIMARY KEY (id),
  CONSTRAINT brotmon_owned_moves_brotmon_id_fkey FOREIGN KEY (brotmon_id) REFERENCES brotmons(id) ON DELETE CASCADE,
  CONSTRAINT brotmon_owned_moves_move_id_fkey FOREIGN KEY (move_id) REFERENCES moves(id) ON DELETE CASCADE,
  CONSTRAINT brotmon_owned_moves_unique_brotmon_move UNIQUE (brotmon_id, move_id)
)