drop trigger if exists "before_insert_trainer_brotmon" on "public"."trainer_brotmons";

drop function if exists "public"."insert_trainer_brotmon"();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.before_insert_trainer_brotmon()
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

CREATE TRIGGER before_insert_trainer_brotmon BEFORE INSERT ON public.trainer_brotmons FOR EACH ROW EXECUTE FUNCTION before_insert_trainer_brotmon();


