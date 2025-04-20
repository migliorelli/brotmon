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
CREATE OR REPLACE FUNCTION create_action(
    p_battle_id uuid,
    p_trainer_id uuid,
    p_brotmon_id uuid,
    p_target_id uuid DEFAULT NULL,
    p_action action_type DEFAULT NULL
)
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
        RAISE EXCEPTION 'Error creating battle action: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
END;
$$;

-- create a new battle
CREATE FUNCTION create_battle(p_host_id uuid)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE 
    v_battle_id uuid;
    v_battle_action_id uuid;
    v_trainer_brotmon_id uuid;
    v_turn_id uuid;
    v_host_username text;
    v_log_message text;
BEGIN
    -- get host username and trainer_brotmons id
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
$$;

-- create a new battle turn
CREATE FUNCTION create_battle_turn(p_battle_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
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
CREATE FUNCTION before_insert_trainer_brotmon()
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

-- trigger function to create brotmon_moves based on new trainer_brotmon
CREATE FUNCTION after_insert_trainer_brotmon()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    move_record RECORD;
BEGIN    
    FOR move_record IN
        SELECT move_id 
        FROM brotmon_owned_moves
        WHERE brotmon_id = NEW.brotmon_id
    LOOP
        INSERT INTO brotmon_moves (trainer_brotmon_id, move_id, current_uses)
        VALUES (
            NEW.id,
            move_record.move_id, 
            (SELECT max_uses FROM moves WHERE id = move_record.move_id)
        );
    END LOOP;

    RETURN NEW;
END;
$$;

-- join a battle as a guest
CREATE FUNCTION join_battle(p_guest_id uuid, p_battle_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE 
    v_battle_action_id uuid;
    v_trainer_brotmon_id uuid;
    v_turn_id uuid;
    v_guest_username text;
    v_log_message text;
BEGIN
    IF (SELECT state FROM battles WHERE id = p_battle_id) != 'WAITING' THEN
        RAISE EXCEPTION 'Battle is not in WAITING state';
    END IF;

    -- get guest username and trainer_brotmons id
    SELECT t.username, tb.id INTO v_guest_username, v_trainer_brotmon_id
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
    VALUES (p_battle_id, p_guest_id, v_trainer_brotmon_id)
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
    
    UPDATE battles
    SET state = 'READY'
    WHERE id = p_battle_id AND state = 'WAITING';

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
$$;
