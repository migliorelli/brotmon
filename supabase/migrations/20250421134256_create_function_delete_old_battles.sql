set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_old_battles()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    CREATE TEMPORARY TABLE trainers_to_delete (id uuid);

    INSERT INTO old_trainers_to_delete
    SELECT host_id FROM battles WHERE created_at < NOW() - INTERVAL '1 day'
    UNION
    SELECT guest_id FROM battles WHERE created_at < NOW() - INTERVAL '1 day';

    DELETE FROM battles WHERE created_at < NOW() - INTERVAL '1 day';

    DELETE FROM trainers WHERE id IN (
        SELECT id FROM old_trainers_to_delete
        EXCEPT
        SELECT host_id FROM battles
        EXCEPT
        SELECT guest_id FROM battles
    );

    DROP TABLE trainers_to_delete;
END;
$function$
;


