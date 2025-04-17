CREATE TABLE moves (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  
  nature text NOT NULL,
  type text NOT NULL,
  power integer NOT NULL,
  accuracy double precision DEFAULT 1 NOT NULL,
  max_uses integer DEFAULT 15 NOT NULL,
  always_crit boolean DEFAULT false NOT NULL,
  priority integer DEFAULT 0 NOT NULL,
  effect jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT moves_pkey PRIMARY KEY (id),
  CONSTRAINT moves_name_key UNIQUE (name)
);
