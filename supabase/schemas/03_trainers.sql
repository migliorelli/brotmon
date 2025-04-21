CREATE TABLE trainers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  
  username text NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT trainers_pkey PRIMARY KEY (id)
);
