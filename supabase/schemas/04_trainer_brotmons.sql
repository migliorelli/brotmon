CREATE TABLE trainer_brotmons (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  trainer_id uuid NOT NULL,
  brotmon_id uuid NOT NULL,
  
  effects jsonb [] DEFAULT '{}' :: jsonb [],
  current_hp integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT trainer_brotmons_pkey PRIMARY KEY (id),
  CONSTRAINT trainer_brotmons_brotmon_id_fkey FOREIGN KEY (brotmon_id) REFERENCES brotmons(id) ON DELETE CASCADE,
  CONSTRAINT trainer_brotmons_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE
);

CREATE
OR REPLACE TRIGGER before_insert_trainer_brotmon BEFORE
INSERT
  ON trainer_brotmons FOR EACH ROW EXECUTE FUNCTION insert_trainer_brotmon();