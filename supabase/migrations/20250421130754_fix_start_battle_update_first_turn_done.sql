set check_function_bodies = off;

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

    -- update battle_turn 0
    UPDATE battle_turns
    SET done = true
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


