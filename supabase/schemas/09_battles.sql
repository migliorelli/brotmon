CREATE TABLE battles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  host_id uuid NOT NULL,
  guest_id uuid,
  
  state battle_state DEFAULT 'WAITING' :: battle_state NOT NULL,
  winner_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT battles_pkey PRIMARY KEY (id),
  CONSTRAINT battles_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES trainers(id),
  CONSTRAINT battles_host_id_fkey FOREIGN KEY (host_id) REFERENCES trainers(id),
  CONSTRAINT battles_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES trainers(id)
);

SELECT cron.schedule(
  'delete_battle_after_one_day',
  '0 0 * * *',
  $$ SELECT public.delete_old_battles(); $$
);