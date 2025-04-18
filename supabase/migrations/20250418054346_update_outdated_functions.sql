drop function if exists "public"."create_action"(p_battle_id uuid, p_trainer_id uuid, p_brotmon_id uuid, p_target_id uuid, p_action text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_action(p_battle_id uuid, p_trainer_id uuid, p_brotmon_id uuid, p_target_id uuid DEFAULT NULL::uuid, p_action action_type DEFAULT NULL::action_type)
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
        RAISE EXCEPTION 'Error creating battle action: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_battle(p_host_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_battle_action_id uuid;
    v_battle_id uuid;
    v_brotmon_id uuid;
    v_turn_id uuid;
    v_host_username text;
    v_log_message text;
BEGIN
    -- get host username and brotmon_id
    SELECT t.username, tb.brotmon_id INTO v_host_username, v_brotmon_id
    FROM trainers as t
    JOIN trainer_brotmons as tb 
    ON tb.id = (SELECT id FROM trainer_brotmons WHERE trainer_id = p_host_id ORDER BY created_at LIMIT 1)
    WHERE t.id = p_host_id;

    IF NOT FOUND THEN 
        RAISE EXCEPTION 'Trainer with ID % not found', p_host_id;
    END IF;

    -- insert battle
    INSERT INTO battles (host_id)
    VALUES (p_host_id)
    RETURNING id INTO v_battle_id;

    -- create host battle action
    INSERT INTO battle_actions (battle_id, trainer_id, brotmon_id)
    VALUES (v_battle_id, p_host_id, v_brotmon_id)
    RETURNING id INTO v_battle_action_id;

    -- create first turn
    INSERT INTO battle_turns (battle_id, host_action_id, turn, done)
    VALUES (v_battle_id, v_battle_action_id, 0, false)
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
    v_host_action_id uuid;
    v_guest_action_id uuid;
    v_turn integer;
BEGIN
    -- get actions ids
    SELECT host_action_id, guest_action_id, turn INTO v_host_action_id, v_guest_action_id, v_turn
    FROM battle_turns
    WHERE battle_id = p_battle_id
    ORDER BY turn DESC
    LIMIT 1;

    INSERT INTO battle_turns (battle_id, host_action_id, guest_action_id, done, turn)
    VALUES (
        p_battle_id,
        v_host_action_id,
        v_guest_action_id,
        false,
        v_turn + 1
    );

EXCEPTION 
    WHEN OTHERS THEN 
        RAISE EXCEPTION 'Error creating battle turn: % (SQLSTATE: %)', sqlerrm, sqlstate;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.join_battle(p_guest_id uuid, p_battle_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_brotmon_id uuid;
    v_turn_id uuid;
    v_battle_action_id uuid;
    v_guest_username text;
    v_log_message text;
BEGIN
    IF (SELECT state FROM battles WHERE id = p_battle_id) != 'WAITING' THEN
        RAISE EXCEPTION 'Battle is not in WAITING state';
    END IF;

    -- get guest username and brotmon_id
    SELECT t.username, tb.brotmon_id INTO v_guest_username, v_brotmon_id
    FROM trainers as t
    JOIN trainer_brotmons as tb 
    ON tb.id = (SELECT id FROM trainer_brotmons WHERE trainer_id = p_guest_id ORDER BY created_at LIMIT 1)
    WHERE t.id = p_guest_id;

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

    -- create guest action
    INSERT INTO battle_actions (battle_id, trainer_id, brotmon_id)
    VALUES (p_battle_id, p_guest_id, v_brotmon_id)
    RETURNING id INTO v_battle_action_id;

    -- update turn and return its id
    UPDATE battle_turns
    SET guest_action_id = v_battle_action_id
    WHERE battle_id = p_battle_id AND turn = 0
    RETURNING id INTO v_turn_id;

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
    v_host_action_id uuid;
    v_guest_action_id uuid;
    v_turn_id uuid;
    v_log_message text;
BEGIN
    -- set battle state
    UPDATE battles
    SET state = 'BATTLEING'
    WHERE id = p_battle_id AND state = 'READY'
    RETURNING id INTO p_battle_id;

    -- get actions ids
    SELECT host_action_id, guest_action_id INTO v_host_action_id, v_guest_action_id
    FROM battle_turns
    WHERE battle_id = p_battle_id AND turn = 0;

    -- create battle_turn 1
    INSERT INTO battle_turns (battle_id, host_action_id, guest_action_id, turn, done)
    VALUES (p_battle_id, v_host_action_id, v_guest_action_id, 1, false)
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


