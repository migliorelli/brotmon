

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."action_type" AS ENUM (
    'SWITCH',
    'MOVE'
);


ALTER TYPE "public"."action_type" OWNER TO "postgres";


CREATE TYPE "public"."battle_state" AS ENUM (
    'WAITING',
    'BATTLEING',
    'FINISHED',
    'READY'
);


ALTER TYPE "public"."battle_state" OWNER TO "postgres";


CREATE TYPE "public"."move_type" AS ENUM (
    'ATTACK',
    'STATUS'
);


ALTER TYPE "public"."move_type" OWNER TO "postgres";


CREATE TYPE "public"."nature" AS ENUM (
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


ALTER TYPE "public"."nature" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_action"("p_battle_id" "uuid", "p_trainer_id" "uuid", "p_brotmon_id" "uuid", "p_target_id" "uuid", "p_action" "text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$declare battle_action_id uuid;

begin
insert into
  battle_actions (
    battle_id,
    trainer_id,
    brotmon_id,
    target_id,
    action
  )
values
  (
    p_battle_id,
    p_trainer_id,
    p_brotmon_id,
    p_target_id,
    p_action
  )
returning
  id into battle_action_id;

return battle_action_id;

exception when others then raise exception 'Error creating battle action: % (SQLSTATE: %)',
sqlerrm,
sqlstate;

end;$$;


ALTER FUNCTION "public"."create_action"("p_battle_id" "uuid", "p_trainer_id" "uuid", "p_brotmon_id" "uuid", "p_target_id" "uuid", "p_action" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_battle"("p_host_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$declare battle_id uuid;

declare turn_id uuid;

declare host_username text;

log_message text;

begin
select
  username into host_username
from
  trainers
where
  id = p_host_id;

if not found then raise exception 'Trainer with ID % not found',
p_host_id;

end if;

insert into
  battles (host_id)
values
  (p_host_id)
returning
  id into battle_id;

insert into
  battle_turns (battle_id, turn, done)
values
  (battle_id, 0, false)
returning
  id into turn_id;

log_message := format(
  '%s created the battle %s!',
  host_username,
  battle_id
);

insert into
  battle_logs (battle_id, turn_id, message)
values
  (battle_id, turn_id, log_message);

return battle_id;

exception when others then raise exception 'Error creating battle: % (SQLSTATE: %)',
sqlerrm,
sqlstate;

end;$$;


ALTER FUNCTION "public"."create_battle"("p_host_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_battle_turn"("p_battle_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$declare host_id uuid;

guest_id uuid;

begin
select
  host_id,
  guest_id into host_id,
  guest_id
from
  battles
where
  id = p_battle_id;

insert into
  battle_turns (battle_id, host_id, guest_id, done, turn)
values
  (
    p_battle_id,
    host_id,
    guest_id,
    false,
    (
      select
        coalesce(max(turn), 0) + 1
      from
        battle_turns
      where
        battle_id = p_battle_id
    )
  );

exception when others then raise exception 'Error creating battle turn: % (SQLSTATE: %)',
sqlerrm,
sqlstate;

end;$$;


ALTER FUNCTION "public"."create_battle_turn"("p_battle_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_trainer"("p_username" "text", "p_emoji" "text", "p_brotmons_json" "json") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$declare
trainer_id UUID;

brotmons_ids UUID[];

begin
select
  array_agg(elem::UUID) into brotmons_ids
from
  json_array_elements_text(p_brotmons_json) as elem;

insert into
  trainers (emoji, username)
values
  (p_emoji, p_username)
returning
  id into trainer_id;

if brotmons_ids is not null
and array_length(brotmons_ids, 1) between 1 and 3  then
insert into
  trainer_brotmons (trainer_id, brotmon_id)
select
  trainer_id,
  unnest(brotmons_ids);

end if;

return trainer_id;

exception when others then raise exception 'Error creating trainer: %',
sqlerrm;

end;$$;


ALTER FUNCTION "public"."create_trainer"("p_username" "text", "p_emoji" "text", "p_brotmons_json" "json") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_trainer_brotmon"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
select
  max_hp into NEW.current_hp
from
  brotmons
where
  id = NEW.brotmon_id;

RETURN NEW;

end;$$;


ALTER FUNCTION "public"."insert_trainer_brotmon"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."join_battle"("p_guest_id" "uuid", "p_battle_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$declare guest_username text;

declare turn_id uuid;

log_message text;

begin
select
  username into guest_username
from
  trainers
where
  id = p_guest_id;

if not found then raise exception 'Trainer with ID % not found',
p_guest_id;

end if;

update battles
set
  guest_id = p_guest_id
where
  id = p_battle_id;

if not found then raise exception 'Battle with ID % not found',
p_battle_id;

end if;

select
  id into turn_id
from
  battle_turns
where
  id = p_battle_id
  and turn = 0;

if not found then raise exception 'Fisrt turn of battle with ID % not found',
p_battle_id;

end if;

log_message := format('%s joined the battle!', guest_username);

insert into
  battle_logs (battle_id, turn_id, message)
values
  (battle_id, turn_id, log_message);

exception when others then raise exception 'Error joining battle: % (SQLSTATE: %)',
sqlerrm,
sqlstate;

end;$$;


ALTER FUNCTION "public"."join_battle"("p_guest_id" "uuid", "p_battle_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."start_battle"("p_battle_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$declare turn_id uuid;

declare log_message text;

begin
update battles
set
  state = "BATTLEING"
where
  state = "READY";

insert into
  battle_turn (battle_id, turn, done)
values
  (p_battle_id, 1, false)
returning
  id into turn_id;

log_message := "The battle has started!";

insert into
  battle_logs (battle_id, turn_id, message)
values
  (p_battle_id, turn_id, log_message);

exception when others then raise exception 'Error starting battle: % (SQLSTATE: %)',
sqlerrm,
sqlstate;

end;$$;


ALTER FUNCTION "public"."start_battle"("p_battle_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."battle_actions" (
    "battle_id" "uuid" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trainer_id" "uuid" NOT NULL,
    "brotmon_id" "uuid" NOT NULL,
    "action" "public"."action_type",
    "target_id" "uuid"
);


ALTER TABLE "public"."battle_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."battle_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "battle_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "turn_id" "uuid" NOT NULL
);


ALTER TABLE "public"."battle_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."battle_turns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "battle_id" "uuid" NOT NULL,
    "host_action_id" "uuid",
    "guest_action_id" "uuid",
    "turn" integer NOT NULL,
    "done" boolean NOT NULL
);


ALTER TABLE "public"."battle_turns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."battles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "host_id" "uuid" NOT NULL,
    "guest_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "state" "public"."battle_state" DEFAULT 'WAITING'::"public"."battle_state" NOT NULL,
    "winner_id" "uuid"
);


ALTER TABLE "public"."battles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brotmon_moves" (
    "brotmon_id" "uuid" NOT NULL,
    "move_id" "uuid" NOT NULL,
    "current_uses" integer NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."brotmon_moves" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brotmons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "emoji" "text" NOT NULL,
    "nature" "text"[] NOT NULL,
    "hp" integer NOT NULL,
    "attack" integer NOT NULL,
    "defense" integer NOT NULL,
    "speed" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."brotmons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moves" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "nature" "text" NOT NULL,
    "type" "text" NOT NULL,
    "power" integer NOT NULL,
    "accuracy" double precision DEFAULT '1'::double precision NOT NULL,
    "max_uses" integer DEFAULT 15 NOT NULL,
    "always_crit" boolean DEFAULT false NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "effect" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."moves" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainer_brotmons" (
    "trainer_id" "uuid" NOT NULL,
    "brotmon_id" "uuid" NOT NULL,
    "current_hp" integer NOT NULL,
    "effects" "jsonb"[] DEFAULT '{}'::"jsonb"[],
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trainer_brotmons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trainers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "username" "text" NOT NULL,
    "emoji" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trainers" OWNER TO "postgres";


ALTER TABLE ONLY "public"."battle_logs"
    ADD CONSTRAINT "battle_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."battle_actions"
    ADD CONSTRAINT "battle_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."battle_turns"
    ADD CONSTRAINT "battle_turn_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."battle_turns"
    ADD CONSTRAINT "battle_turns_unique_turn_per_battle_id" UNIQUE ("battle_id", "turn");



ALTER TABLE ONLY "public"."battles"
    ADD CONSTRAINT "battles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brotmon_moves"
    ADD CONSTRAINT "brotmon_moves_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brotmons"
    ADD CONSTRAINT "brotmons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moves"
    ADD CONSTRAINT "moves_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."moves"
    ADD CONSTRAINT "moves_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainer_brotmons"
    ADD CONSTRAINT "trainer_brotmons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trainers"
    ADD CONSTRAINT "trainers_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "before_insert_trainer_brotmon" BEFORE INSERT ON "public"."trainer_brotmons" FOR EACH ROW EXECUTE FUNCTION "public"."insert_trainer_brotmon"();



ALTER TABLE ONLY "public"."battle_logs"
    ADD CONSTRAINT "battle_logs_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."battle_logs"
    ADD CONSTRAINT "battle_logs_turn_id_fkey" FOREIGN KEY ("turn_id") REFERENCES "public"."battle_turns"("id");



ALTER TABLE ONLY "public"."battle_actions"
    ADD CONSTRAINT "battle_states_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."battle_actions"
    ADD CONSTRAINT "battle_states_brotmon_id_fkey" FOREIGN KEY ("brotmon_id") REFERENCES "public"."trainer_brotmons"("id");



ALTER TABLE ONLY "public"."battle_actions"
    ADD CONSTRAINT "battle_states_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id");



ALTER TABLE ONLY "public"."battle_turns"
    ADD CONSTRAINT "battle_turn_battle_id_fkey" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id");



ALTER TABLE ONLY "public"."battle_turns"
    ADD CONSTRAINT "battle_turn_guest_action_id_fkey" FOREIGN KEY ("guest_action_id") REFERENCES "public"."battle_actions"("id");



ALTER TABLE ONLY "public"."battle_turns"
    ADD CONSTRAINT "battle_turn_host_action_id_fkey" FOREIGN KEY ("host_action_id") REFERENCES "public"."battle_actions"("id");



ALTER TABLE ONLY "public"."battles"
    ADD CONSTRAINT "battles_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "public"."trainers"("id");



ALTER TABLE ONLY "public"."battles"
    ADD CONSTRAINT "battles_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."trainers"("id");



ALTER TABLE ONLY "public"."battles"
    ADD CONSTRAINT "battles_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."trainers"("id");



ALTER TABLE ONLY "public"."brotmon_moves"
    ADD CONSTRAINT "brotmon_moves_brotmon_id_fkey" FOREIGN KEY ("brotmon_id") REFERENCES "public"."brotmons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."brotmon_moves"
    ADD CONSTRAINT "brotmon_moves_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "public"."moves"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_brotmons"
    ADD CONSTRAINT "trainer_brotmons_brotmon_id_fkey" FOREIGN KEY ("brotmon_id") REFERENCES "public"."brotmons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trainer_brotmons"
    ADD CONSTRAINT "trainer_brotmons_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."create_action"("p_battle_id" "uuid", "p_trainer_id" "uuid", "p_brotmon_id" "uuid", "p_target_id" "uuid", "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_action"("p_battle_id" "uuid", "p_trainer_id" "uuid", "p_brotmon_id" "uuid", "p_target_id" "uuid", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_action"("p_battle_id" "uuid", "p_trainer_id" "uuid", "p_brotmon_id" "uuid", "p_target_id" "uuid", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_battle"("p_host_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_battle"("p_host_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_battle"("p_host_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_battle_turn"("p_battle_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_battle_turn"("p_battle_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_battle_turn"("p_battle_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_trainer"("p_username" "text", "p_emoji" "text", "p_brotmons_json" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."create_trainer"("p_username" "text", "p_emoji" "text", "p_brotmons_json" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_trainer"("p_username" "text", "p_emoji" "text", "p_brotmons_json" "json") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_trainer_brotmon"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_trainer_brotmon"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_trainer_brotmon"() TO "service_role";



GRANT ALL ON FUNCTION "public"."join_battle"("p_guest_id" "uuid", "p_battle_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."join_battle"("p_guest_id" "uuid", "p_battle_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_battle"("p_guest_id" "uuid", "p_battle_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."start_battle"("p_battle_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."start_battle"("p_battle_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_battle"("p_battle_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."battle_actions" TO "anon";
GRANT ALL ON TABLE "public"."battle_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."battle_actions" TO "service_role";



GRANT ALL ON TABLE "public"."battle_logs" TO "anon";
GRANT ALL ON TABLE "public"."battle_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."battle_logs" TO "service_role";



GRANT ALL ON TABLE "public"."battle_turns" TO "anon";
GRANT ALL ON TABLE "public"."battle_turns" TO "authenticated";
GRANT ALL ON TABLE "public"."battle_turns" TO "service_role";



GRANT ALL ON TABLE "public"."battles" TO "anon";
GRANT ALL ON TABLE "public"."battles" TO "authenticated";
GRANT ALL ON TABLE "public"."battles" TO "service_role";



GRANT ALL ON TABLE "public"."brotmon_moves" TO "anon";
GRANT ALL ON TABLE "public"."brotmon_moves" TO "authenticated";
GRANT ALL ON TABLE "public"."brotmon_moves" TO "service_role";



GRANT ALL ON TABLE "public"."brotmons" TO "anon";
GRANT ALL ON TABLE "public"."brotmons" TO "authenticated";
GRANT ALL ON TABLE "public"."brotmons" TO "service_role";



GRANT ALL ON TABLE "public"."moves" TO "anon";
GRANT ALL ON TABLE "public"."moves" TO "authenticated";
GRANT ALL ON TABLE "public"."moves" TO "service_role";



GRANT ALL ON TABLE "public"."trainer_brotmons" TO "anon";
GRANT ALL ON TABLE "public"."trainer_brotmons" TO "authenticated";
GRANT ALL ON TABLE "public"."trainer_brotmons" TO "service_role";



GRANT ALL ON TABLE "public"."trainers" TO "anon";
GRANT ALL ON TABLE "public"."trainers" TO "authenticated";
GRANT ALL ON TABLE "public"."trainers" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
