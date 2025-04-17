CREATE TABLE brotmons (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  
  name text NOT NULL,
  emoji text NOT NULL,
  nature text [] NOT NULL,
  hp integer NOT NULL,
  attack integer NOT NULL,
  defense integer NOT NULL,
  speed integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,

  CONSTRAINT brotmons_pkey PRIMARY KEY (id)
);