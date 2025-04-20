set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_battle(p_host_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE 
    v_battle_action_id uuid;
    v_battle_id uuid;
    v_trainer_brotmon_id uuid;
    v_turn_id uuid;
    v_host_username text;
    v_log_message text;
BEGIN
    -- get host username and brotmon_id
    SELECT t.username, tb.id INTO v_host_username, v_trainer_brotmon_id
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
    VALUES (v_battle_id, p_host_id, v_trainer_brotmon_id)
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


