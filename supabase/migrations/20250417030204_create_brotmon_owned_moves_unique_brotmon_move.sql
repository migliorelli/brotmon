CREATE UNIQUE INDEX brotmon_owned_moves_unique_brotmon_move ON public.brotmon_owned_moves USING btree (brotmon_id, move_id);

alter table "public"."brotmon_owned_moves" add constraint "brotmon_owned_moves_unique_brotmon_move" UNIQUE using index "brotmon_owned_moves_unique_brotmon_move";


