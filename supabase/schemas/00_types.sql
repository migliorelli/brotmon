CREATE TYPE action_type AS ENUM ('SWITCH', 'MOVE');

CREATE TYPE battle_state AS ENUM (
  'WAITING',
  'BATTLEING',
  'FINISHED',
  'READY'
);

CREATE TYPE move_type AS ENUM ('ATTACK', 'STATUS');

CREATE TYPE nature AS ENUM (
  'NORMAL',
  'FIGHTING',
  'FIRE',
  'WATER',
  'GRASS',
  'ELECTRIC',
  'ICE',
  'ROCK',
  'GROUND',
  'FLYING',
  'BUG',
  'POISON'
);