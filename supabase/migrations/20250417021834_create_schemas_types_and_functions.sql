create type "public"."action_type" as enum ('SWITCH', 'MOVE');

create type "public"."battle_state" as enum ('WAITING', 'BATTLEING', 'FINISHED', 'READY');

create type "public"."move_type" as enum ('ATTACK', 'STATUS');

create type "public"."nature" as enum ('NORMAL', 'FIGHTING', 'FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'ICE', 'ROCK', 'GROUND', 'FLYING', 'BUG', 'POISON');

create table "public"."battle_actions" (
    "id" uuid not null default gen_random_uuid(),
    "battle_id" uuid not null,
    "trainer_id" uuid not null,
    "brotmon_id" uuid not null,
    "action" action_type,
    "target_id" uuid
);


create table "public"."battle_logs" (
    "id" uuid not null default gen_random_uuid(),
    "battle_id" uuid not null,
    "turn_id" uuid not null,
    "message" text not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."battle_turns" (
    "id" uuid not null default gen_random_uuid(),
    "battle_id" uuid not null,
    "host_action_id" uuid,
    "guest_action_id" uuid,
    "turn" integer not null,
    "done" boolean not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."battles" (
    "id" uuid not null default gen_random_uuid(),
    "host_id" uuid not null,
    "guest_id" uuid,
    "state" battle_state not null default 'WAITING'::battle_state,
    "winner_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."brotmon_moves" (
    "id" uuid not null default gen_random_uuid(),
    "trainer_brotmon_id" uuid not null,
    "move_id" uuid not null,
    "current_uses" integer not null
);


create table "public"."brotmons" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "emoji" text not null,
    "nature" text[] not null,
    "hp" integer not null,
    "attack" integer not null,
    "defense" integer not null,
    "speed" integer not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."moves" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "nature" text not null,
    "type" text not null,
    "power" integer not null,
    "accuracy" double precision not null default 1,
    "max_uses" integer not null default 15,
    "always_crit" boolean not null default false,
    "priority" integer not null default 0,
    "effect" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."trainer_brotmons" (
    "id" uuid not null default gen_random_uuid(),
    "trainer_id" uuid not null,
    "brotmon_id" uuid not null,
    "effects" jsonb[] default '{}'::jsonb[],
    "current_hp" integer not null,
    "created_at" timestamp with time zone not null default now()
);


create table "public"."trainers" (
    "id" uuid not null default gen_random_uuid(),
    "username" text not null,
    "emoji" text not null,
    "created_at" timestamp with time zone not null default now()
);


CREATE UNIQUE INDEX battle_logs_pkey ON public.battle_logs USING btree (id);

CREATE UNIQUE INDEX battle_states_pkey ON public.battle_actions USING btree (id);

CREATE UNIQUE INDEX battle_turn_pkey ON public.battle_turns USING btree (id);

CREATE UNIQUE INDEX battle_turns_unique_turn_per_battle_id ON public.battle_turns USING btree (battle_id, turn);

CREATE UNIQUE INDEX battles_pkey ON public.battles USING btree (id);

CREATE UNIQUE INDEX brotmon_moves_pkey ON public.brotmon_moves USING btree (id);

CREATE UNIQUE INDEX brotmons_pkey ON public.brotmons USING btree (id);

CREATE UNIQUE INDEX moves_name_key ON public.moves USING btree (name);

CREATE UNIQUE INDEX moves_pkey ON public.moves USING btree (id);

CREATE UNIQUE INDEX trainer_brotmons_pkey ON public.trainer_brotmons USING btree (id);

CREATE UNIQUE INDEX trainers_pkey ON public.trainers USING btree (id);

alter table "public"."battle_actions" add constraint "battle_states_pkey" PRIMARY KEY using index "battle_states_pkey";

alter table "public"."battle_logs" add constraint "battle_logs_pkey" PRIMARY KEY using index "battle_logs_pkey";

alter table "public"."battle_turns" add constraint "battle_turn_pkey" PRIMARY KEY using index "battle_turn_pkey";

alter table "public"."battles" add constraint "battles_pkey" PRIMARY KEY using index "battles_pkey";

alter table "public"."brotmon_moves" add constraint "brotmon_moves_pkey" PRIMARY KEY using index "brotmon_moves_pkey";

alter table "public"."brotmons" add constraint "brotmons_pkey" PRIMARY KEY using index "brotmons_pkey";

alter table "public"."moves" add constraint "moves_pkey" PRIMARY KEY using index "moves_pkey";

alter table "public"."trainer_brotmons" add constraint "trainer_brotmons_pkey" PRIMARY KEY using index "trainer_brotmons_pkey";

alter table "public"."trainers" add constraint "trainers_pkey" PRIMARY KEY using index "trainers_pkey";

alter table "public"."battle_actions" add constraint "battle_states_battle_id_fkey" FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE not valid;

alter table "public"."battle_actions" validate constraint "battle_states_battle_id_fkey";

alter table "public"."battle_actions" add constraint "battle_states_brotmon_id_fkey" FOREIGN KEY (brotmon_id) REFERENCES trainer_brotmons(id) not valid;

alter table "public"."battle_actions" validate constraint "battle_states_brotmon_id_fkey";

alter table "public"."battle_actions" add constraint "battle_states_trainer_id_fkey" FOREIGN KEY (trainer_id) REFERENCES trainers(id) not valid;

alter table "public"."battle_actions" validate constraint "battle_states_trainer_id_fkey";

alter table "public"."battle_logs" add constraint "battle_logs_battle_id_fkey" FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE not valid;

alter table "public"."battle_logs" validate constraint "battle_logs_battle_id_fkey";

alter table "public"."battle_logs" add constraint "battle_logs_turn_id_fkey" FOREIGN KEY (turn_id) REFERENCES battle_turns(id) not valid;

alter table "public"."battle_logs" validate constraint "battle_logs_turn_id_fkey";

alter table "public"."battle_turns" add constraint "battle_turn_guest_action_id_fkey" FOREIGN KEY (guest_action_id) REFERENCES battle_actions(id) not valid;

alter table "public"."battle_turns" validate constraint "battle_turn_guest_action_id_fkey";

alter table "public"."battle_turns" add constraint "battle_turn_host_action_id_fkey" FOREIGN KEY (host_action_id) REFERENCES battle_actions(id) not valid;

alter table "public"."battle_turns" validate constraint "battle_turn_host_action_id_fkey";

alter table "public"."battle_turns" add constraint "battle_turns_battle_id_fkey" FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE not valid;

alter table "public"."battle_turns" validate constraint "battle_turns_battle_id_fkey";

alter table "public"."battle_turns" add constraint "battle_turns_unique_turn_per_battle_id" UNIQUE using index "battle_turns_unique_turn_per_battle_id";

alter table "public"."battles" add constraint "battles_guest_id_fkey" FOREIGN KEY (guest_id) REFERENCES trainers(id) not valid;

alter table "public"."battles" validate constraint "battles_guest_id_fkey";

alter table "public"."battles" add constraint "battles_host_id_fkey" FOREIGN KEY (host_id) REFERENCES trainers(id) not valid;

alter table "public"."battles" validate constraint "battles_host_id_fkey";

alter table "public"."battles" add constraint "battles_winner_id_fkey" FOREIGN KEY (winner_id) REFERENCES trainers(id) not valid;

alter table "public"."battles" validate constraint "battles_winner_id_fkey";

alter table "public"."brotmon_moves" add constraint "brotmon_moves_move_id_fkey" FOREIGN KEY (move_id) REFERENCES moves(id) ON DELETE CASCADE not valid;

alter table "public"."brotmon_moves" validate constraint "brotmon_moves_move_id_fkey";

alter table "public"."brotmon_moves" add constraint "brotmon_moves_trainer_brotmon_id_fkey" FOREIGN KEY (trainer_brotmon_id) REFERENCES trainer_brotmons(id) ON DELETE CASCADE not valid;

alter table "public"."brotmon_moves" validate constraint "brotmon_moves_trainer_brotmon_id_fkey";

alter table "public"."moves" add constraint "moves_name_key" UNIQUE using index "moves_name_key";

alter table "public"."trainer_brotmons" add constraint "trainer_brotmons_brotmon_id_fkey" FOREIGN KEY (brotmon_id) REFERENCES brotmons(id) ON DELETE CASCADE not valid;

alter table "public"."trainer_brotmons" validate constraint "trainer_brotmons_brotmon_id_fkey";

alter table "public"."trainer_brotmons" add constraint "trainer_brotmons_trainer_id_fkey" FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE CASCADE not valid;

alter table "public"."trainer_brotmons" validate constraint "trainer_brotmons_trainer_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.associate_moves_to_brotmon(p_brotmon_name text, p_move_names text[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_brotmon_id uuid;
    v_move_id uuid;
    v_move_name text;
BEGIN
    -- get the brotmon id
    SELECT id INTO v_brotmon_id FROM brotmons WHERE name = p_brotmon_name;
    
    IF v_brotmon_id IS NULL THEN
        RAISE EXCEPTION 'Brotmon % not found', p_brotmon_name;
    END IF;
    
    -- associate each move
    FOREACH v_move_name IN ARRAY p_move_names LOOP
        -- get the move ID
        SELECT id INTO v_move_id FROM moves WHERE name = v_move_name;
        
        IF v_move_id IS NULL THEN
            RAISE WARNING 'Move % not found for brotmon %', v_move_name, p_brotmon_name;
            CONTINUE;
        END IF;
        
        -- insert the association if it doesn't exist
        INSERT INTO brotmon_owned_moves (brotmon_id, move_id)
        VALUES (v_brotmon_id, v_move_id)
        ON CONFLICT (brotmon_id, move_id) DO NOTHING;
    END LOOP;

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE EXCEPTION 'Error associating move % with brotmon % : % (SQLSTATE: %)', v_move_name, p_brotmon_name, sqlerrm, sqlstate;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_action(p_battle_id uuid, p_trainer_id uuid, p_brotmon_id uuid, p_target_id uuid, p_action text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_battle_action_id uuid;
BEGIN
    INSERT INTO battle_actions (
        battle_id,
        trainer_id,
        brotmon_id,
        target_id,
        action
    )
    VALUES (
        p_battle_id,
        p_trainer_id,
        p_brotmon_id,
        p_target_id,
        p_action
    )
    RETURNING id INTO v_battle_action_id;

    RETURN v_battle_action_id;

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE EXCEPTION 'Error creating battle action: % (SQLSTATE: %)', sqlerrm, sqlstate;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_battle(p_host_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_battle_id uuid;
    v_turn_id uuid;
    v_host_username text;
    v_log_message text;
BEGIN
    -- get host username
    SELECT username INTO v_host_username
    FROM trainers
    WHERE id = p_host_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'Trainer with ID % not found', p_host_id;
    END IF;

    -- insert battle
    INSERT INTO battles (host_id)
    VALUES (p_host_id)
    RETURNING id INTO v_battle_id;

    -- create first turn
    INSERT INTO battle_turns (battle_id, turn, done)
    VALUES (v_battle_id, 0, false)
    RETURNING id INTO v_turn_id;

    -- first log message
    v_log_message := FORMAT('%s created the battle %s!', v_host_username, v_battle_id);

    -- create first log
    INSERT INTO battle_logs (battle_id, turn_id, message)
    VALUES (v_battle_id, v_turn_id, v_log_message);

    RETURN v_battle_id;

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE EXCEPTION 'Error creating battle: % (SQLSTATE: %)', sqlerrm, sqlstate;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_battle_turn(p_battle_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_host_id uuid;
    v_guest_id uuid;
BEGIN
    -- get host_id and guest_id
    SELECT host_id, guest_id INTO v_host_id, v_guest_id
    FROM battles
    WHERE id = p_battle_id;

    INSERT INTO battle_turns (battle_id, host_id, guest_id, done, turn)
    VALUES (
        p_battle_id,
        v_host_id,
        v_guest_id,
        false,
        (
            SELECT COALESCE(MAX(turn), 0) + 1
            FROM battle_turns
            WHERE battle_id = p_battle_id
        )
    );

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE EXCEPTION 'Error creating battle turn: % (SQLSTATE: %)', sqlerrm, sqlstate;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_trainer(p_username text, p_emoji text, p_brotmons_ids uuid[])
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_trainer_id uuid;
BEGIN
  -- insert trainer
  INSERT INTO trainers (emoji, username)
  VALUES (p_emoji, p_username)
  RETURNING id INTO v_trainer_id;

  -- insert brotmons if exists
  IF p_brotmons_ids IS NOT NULL AND array_length(p_brotmons_ids, 1) BETWEEN 1 AND 3 THEN
    INSERT INTO trainer_brotmons (trainer_id, brotmon_id)
    SELECT v_trainer_id, UNNEST(p_brotmons_ids);
  END IF;

  RETURN v_trainer_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating trainer: %', SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_trainer_brotmon()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    SELECT hp INTO NEW.current_hp
    FROM brotmons
    WHERE id = NEW.brotmon_id;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.join_battle(p_guest_id uuid, p_battle_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_guest_username text;
    v_turn_id uuid;
    v_log_message text;
BEGIN
    -- get guest username
    SELECT username INTO v_guest_username
    FROM trainers
    WHERE id = p_guest_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'Trainer with ID % not found', p_guest_id;
    END IF;

    -- update battle with guest
    UPDATE battles
    SET guest_id = p_guest_id
    WHERE id = p_battle_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'Battle with ID % not found', p_battle_id;
    END IF;

    -- get turn turn_id
    SELECT id INTO v_turn_id
    FROM battle_turns
    WHERE battle_id = p_battle_id
    AND turn = 0;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'First turn of battle with ID % not found', p_battle_id;
    END IF;

    -- log message
    v_log_message := FORMAT('%s joined the battle!', v_guest_username);

    -- create log
    INSERT INTO battle_logs (battle_id, turn_id, message)
    VALUES (p_battle_id, v_turn_id, v_log_message);

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE EXCEPTION 'Error joining battle: % (SQLSTATE: %)', sqlerrm, sqlstate;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.start_battle(p_battle_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_turn_id uuid;
    v_log_message text;
BEGIN
    -- set battle state
    UPDATE battles
    SET state = 'BATTLEING'
    WHERE id = p_battle_id
    AND state = 'READY';

    -- create battle_turn 1
    INSERT INTO battle_turns (battle_id, turn, done)
    VALUES (p_battle_id, 1, false)
    RETURNING id INTO v_turn_id;

    -- log message
    v_log_message := 'The battle has started!';

    -- create log message
    INSERT INTO battle_logs (battle_id, turn_id, message)
    VALUES (p_battle_id, v_turn_id, v_log_message);

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE EXCEPTION 'Error starting battle: % (SQLSTATE: %)', sqlerrm, sqlstate;
END;
$function$
;

grant delete on table "public"."battle_actions" to "anon";

grant insert on table "public"."battle_actions" to "anon";

grant references on table "public"."battle_actions" to "anon";

grant select on table "public"."battle_actions" to "anon";

grant trigger on table "public"."battle_actions" to "anon";

grant truncate on table "public"."battle_actions" to "anon";

grant update on table "public"."battle_actions" to "anon";

grant delete on table "public"."battle_actions" to "authenticated";

grant insert on table "public"."battle_actions" to "authenticated";

grant references on table "public"."battle_actions" to "authenticated";

grant select on table "public"."battle_actions" to "authenticated";

grant trigger on table "public"."battle_actions" to "authenticated";

grant truncate on table "public"."battle_actions" to "authenticated";

grant update on table "public"."battle_actions" to "authenticated";

grant delete on table "public"."battle_actions" to "service_role";

grant insert on table "public"."battle_actions" to "service_role";

grant references on table "public"."battle_actions" to "service_role";

grant select on table "public"."battle_actions" to "service_role";

grant trigger on table "public"."battle_actions" to "service_role";

grant truncate on table "public"."battle_actions" to "service_role";

grant update on table "public"."battle_actions" to "service_role";

grant delete on table "public"."battle_logs" to "anon";

grant insert on table "public"."battle_logs" to "anon";

grant references on table "public"."battle_logs" to "anon";

grant select on table "public"."battle_logs" to "anon";

grant trigger on table "public"."battle_logs" to "anon";

grant truncate on table "public"."battle_logs" to "anon";

grant update on table "public"."battle_logs" to "anon";

grant delete on table "public"."battle_logs" to "authenticated";

grant insert on table "public"."battle_logs" to "authenticated";

grant references on table "public"."battle_logs" to "authenticated";

grant select on table "public"."battle_logs" to "authenticated";

grant trigger on table "public"."battle_logs" to "authenticated";

grant truncate on table "public"."battle_logs" to "authenticated";

grant update on table "public"."battle_logs" to "authenticated";

grant delete on table "public"."battle_logs" to "service_role";

grant insert on table "public"."battle_logs" to "service_role";

grant references on table "public"."battle_logs" to "service_role";

grant select on table "public"."battle_logs" to "service_role";

grant trigger on table "public"."battle_logs" to "service_role";

grant truncate on table "public"."battle_logs" to "service_role";

grant update on table "public"."battle_logs" to "service_role";

grant delete on table "public"."battle_turns" to "anon";

grant insert on table "public"."battle_turns" to "anon";

grant references on table "public"."battle_turns" to "anon";

grant select on table "public"."battle_turns" to "anon";

grant trigger on table "public"."battle_turns" to "anon";

grant truncate on table "public"."battle_turns" to "anon";

grant update on table "public"."battle_turns" to "anon";

grant delete on table "public"."battle_turns" to "authenticated";

grant insert on table "public"."battle_turns" to "authenticated";

grant references on table "public"."battle_turns" to "authenticated";

grant select on table "public"."battle_turns" to "authenticated";

grant trigger on table "public"."battle_turns" to "authenticated";

grant truncate on table "public"."battle_turns" to "authenticated";

grant update on table "public"."battle_turns" to "authenticated";

grant delete on table "public"."battle_turns" to "service_role";

grant insert on table "public"."battle_turns" to "service_role";

grant references on table "public"."battle_turns" to "service_role";

grant select on table "public"."battle_turns" to "service_role";

grant trigger on table "public"."battle_turns" to "service_role";

grant truncate on table "public"."battle_turns" to "service_role";

grant update on table "public"."battle_turns" to "service_role";

grant delete on table "public"."battles" to "anon";

grant insert on table "public"."battles" to "anon";

grant references on table "public"."battles" to "anon";

grant select on table "public"."battles" to "anon";

grant trigger on table "public"."battles" to "anon";

grant truncate on table "public"."battles" to "anon";

grant update on table "public"."battles" to "anon";

grant delete on table "public"."battles" to "authenticated";

grant insert on table "public"."battles" to "authenticated";

grant references on table "public"."battles" to "authenticated";

grant select on table "public"."battles" to "authenticated";

grant trigger on table "public"."battles" to "authenticated";

grant truncate on table "public"."battles" to "authenticated";

grant update on table "public"."battles" to "authenticated";

grant delete on table "public"."battles" to "service_role";

grant insert on table "public"."battles" to "service_role";

grant references on table "public"."battles" to "service_role";

grant select on table "public"."battles" to "service_role";

grant trigger on table "public"."battles" to "service_role";

grant truncate on table "public"."battles" to "service_role";

grant update on table "public"."battles" to "service_role";

grant delete on table "public"."brotmon_moves" to "anon";

grant insert on table "public"."brotmon_moves" to "anon";

grant references on table "public"."brotmon_moves" to "anon";

grant select on table "public"."brotmon_moves" to "anon";

grant trigger on table "public"."brotmon_moves" to "anon";

grant truncate on table "public"."brotmon_moves" to "anon";

grant update on table "public"."brotmon_moves" to "anon";

grant delete on table "public"."brotmon_moves" to "authenticated";

grant insert on table "public"."brotmon_moves" to "authenticated";

grant references on table "public"."brotmon_moves" to "authenticated";

grant select on table "public"."brotmon_moves" to "authenticated";

grant trigger on table "public"."brotmon_moves" to "authenticated";

grant truncate on table "public"."brotmon_moves" to "authenticated";

grant update on table "public"."brotmon_moves" to "authenticated";

grant delete on table "public"."brotmon_moves" to "service_role";

grant insert on table "public"."brotmon_moves" to "service_role";

grant references on table "public"."brotmon_moves" to "service_role";

grant select on table "public"."brotmon_moves" to "service_role";

grant trigger on table "public"."brotmon_moves" to "service_role";

grant truncate on table "public"."brotmon_moves" to "service_role";

grant update on table "public"."brotmon_moves" to "service_role";

grant delete on table "public"."brotmons" to "anon";

grant insert on table "public"."brotmons" to "anon";

grant references on table "public"."brotmons" to "anon";

grant select on table "public"."brotmons" to "anon";

grant trigger on table "public"."brotmons" to "anon";

grant truncate on table "public"."brotmons" to "anon";

grant update on table "public"."brotmons" to "anon";

grant delete on table "public"."brotmons" to "authenticated";

grant insert on table "public"."brotmons" to "authenticated";

grant references on table "public"."brotmons" to "authenticated";

grant select on table "public"."brotmons" to "authenticated";

grant trigger on table "public"."brotmons" to "authenticated";

grant truncate on table "public"."brotmons" to "authenticated";

grant update on table "public"."brotmons" to "authenticated";

grant delete on table "public"."brotmons" to "service_role";

grant insert on table "public"."brotmons" to "service_role";

grant references on table "public"."brotmons" to "service_role";

grant select on table "public"."brotmons" to "service_role";

grant trigger on table "public"."brotmons" to "service_role";

grant truncate on table "public"."brotmons" to "service_role";

grant update on table "public"."brotmons" to "service_role";

grant delete on table "public"."moves" to "anon";

grant insert on table "public"."moves" to "anon";

grant references on table "public"."moves" to "anon";

grant select on table "public"."moves" to "anon";

grant trigger on table "public"."moves" to "anon";

grant truncate on table "public"."moves" to "anon";

grant update on table "public"."moves" to "anon";

grant delete on table "public"."moves" to "authenticated";

grant insert on table "public"."moves" to "authenticated";

grant references on table "public"."moves" to "authenticated";

grant select on table "public"."moves" to "authenticated";

grant trigger on table "public"."moves" to "authenticated";

grant truncate on table "public"."moves" to "authenticated";

grant update on table "public"."moves" to "authenticated";

grant delete on table "public"."moves" to "service_role";

grant insert on table "public"."moves" to "service_role";

grant references on table "public"."moves" to "service_role";

grant select on table "public"."moves" to "service_role";

grant trigger on table "public"."moves" to "service_role";

grant truncate on table "public"."moves" to "service_role";

grant update on table "public"."moves" to "service_role";

grant delete on table "public"."trainer_brotmons" to "anon";

grant insert on table "public"."trainer_brotmons" to "anon";

grant references on table "public"."trainer_brotmons" to "anon";

grant select on table "public"."trainer_brotmons" to "anon";

grant trigger on table "public"."trainer_brotmons" to "anon";

grant truncate on table "public"."trainer_brotmons" to "anon";

grant update on table "public"."trainer_brotmons" to "anon";

grant delete on table "public"."trainer_brotmons" to "authenticated";

grant insert on table "public"."trainer_brotmons" to "authenticated";

grant references on table "public"."trainer_brotmons" to "authenticated";

grant select on table "public"."trainer_brotmons" to "authenticated";

grant trigger on table "public"."trainer_brotmons" to "authenticated";

grant truncate on table "public"."trainer_brotmons" to "authenticated";

grant update on table "public"."trainer_brotmons" to "authenticated";

grant delete on table "public"."trainer_brotmons" to "service_role";

grant insert on table "public"."trainer_brotmons" to "service_role";

grant references on table "public"."trainer_brotmons" to "service_role";

grant select on table "public"."trainer_brotmons" to "service_role";

grant trigger on table "public"."trainer_brotmons" to "service_role";

grant truncate on table "public"."trainer_brotmons" to "service_role";

grant update on table "public"."trainer_brotmons" to "service_role";

grant delete on table "public"."trainers" to "anon";

grant insert on table "public"."trainers" to "anon";

grant references on table "public"."trainers" to "anon";

grant select on table "public"."trainers" to "anon";

grant trigger on table "public"."trainers" to "anon";

grant truncate on table "public"."trainers" to "anon";

grant update on table "public"."trainers" to "anon";

grant delete on table "public"."trainers" to "authenticated";

grant insert on table "public"."trainers" to "authenticated";

grant references on table "public"."trainers" to "authenticated";

grant select on table "public"."trainers" to "authenticated";

grant trigger on table "public"."trainers" to "authenticated";

grant truncate on table "public"."trainers" to "authenticated";

grant update on table "public"."trainers" to "authenticated";

grant delete on table "public"."trainers" to "service_role";

grant insert on table "public"."trainers" to "service_role";

grant references on table "public"."trainers" to "service_role";

grant select on table "public"."trainers" to "service_role";

grant trigger on table "public"."trainers" to "service_role";

grant truncate on table "public"."trainers" to "service_role";

grant update on table "public"."trainers" to "service_role";

CREATE TRIGGER before_insert_trainer_brotmon BEFORE INSERT ON public.trainer_brotmons FOR EACH ROW EXECUTE FUNCTION insert_trainer_brotmon();


