set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.after_insert_trainer_brotmon()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

CREATE TRIGGER after_inser_trainer_brotmon AFTER INSERT ON public.trainer_brotmons FOR EACH ROW EXECUTE FUNCTION after_insert_trainer_brotmon();


