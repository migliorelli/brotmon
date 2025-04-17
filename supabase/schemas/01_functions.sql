-- associate moves to a specific brotmon
CREATE FUNCTION associate_moves_to_brotmon(p_brotmon_name text, p_move_names text[])
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;

-- create an action in a battle
CREATE FUNCTION create_action(p_battle_id uuid, p_trainer_id uuid, p_brotmon_id uuid, p_target_id uuid, p_action text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
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
$$;

-- create a new battle
CREATE FUNCTION create_battle(p_host_id uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $$
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
$$;

-- create a new battle turn
CREATE FUNCTION create_battle_turn(p_battle_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;

-- create a new trainer
CREATE FUNCTION create_trainer(p_username text, p_emoji text, p_brotmons_ids uuid[])
RETURNS uuid
LANGUAGE plpgsql
AS $$
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
$$;


-- trigger function to set the current HP of a trainer's brotmon
CREATE FUNCTION insert_trainer_brotmon()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT hp INTO NEW.current_hp
    FROM brotmons
    WHERE id = NEW.brotmon_id;

    RETURN NEW;
END;
$$;

-- join a battle as a guest
CREATE FUNCTION join_battle(p_guest_id uuid, p_battle_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;

-- start a battle
CREATE FUNCTION start_battle(p_battle_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;
