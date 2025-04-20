set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.insert_trainer_brotmon()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    move_record RECORD;
BEGIN
    -- set NEW current hp 
    SELECT hp INTO NEW.current_hp
    FROM brotmons
    WHERE id = NEW.brotmon_id;

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
$function$
;


