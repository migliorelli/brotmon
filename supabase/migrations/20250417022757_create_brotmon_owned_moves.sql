create table "public"."brotmon_owned_moves" (
    "id" uuid not null default gen_random_uuid(),
    "brotmon_id" uuid not null,
    "move_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
);


CREATE UNIQUE INDEX brotmon_owned_moves_pkey ON public.brotmon_owned_moves USING btree (id);

alter table "public"."brotmon_owned_moves" add constraint "brotmon_owned_moves_pkey" PRIMARY KEY using index "brotmon_owned_moves_pkey";

alter table "public"."brotmon_owned_moves" add constraint "brotmon_owned_moves_brotmon_id_fkey" FOREIGN KEY (brotmon_id) REFERENCES brotmons(id) ON DELETE CASCADE not valid;

alter table "public"."brotmon_owned_moves" validate constraint "brotmon_owned_moves_brotmon_id_fkey";

alter table "public"."brotmon_owned_moves" add constraint "brotmon_owned_moves_move_id_fkey" FOREIGN KEY (move_id) REFERENCES moves(id) ON DELETE CASCADE not valid;

alter table "public"."brotmon_owned_moves" validate constraint "brotmon_owned_moves_move_id_fkey";

grant delete on table "public"."brotmon_owned_moves" to "anon";

grant insert on table "public"."brotmon_owned_moves" to "anon";

grant references on table "public"."brotmon_owned_moves" to "anon";

grant select on table "public"."brotmon_owned_moves" to "anon";

grant trigger on table "public"."brotmon_owned_moves" to "anon";

grant truncate on table "public"."brotmon_owned_moves" to "anon";

grant update on table "public"."brotmon_owned_moves" to "anon";

grant delete on table "public"."brotmon_owned_moves" to "authenticated";

grant insert on table "public"."brotmon_owned_moves" to "authenticated";

grant references on table "public"."brotmon_owned_moves" to "authenticated";

grant select on table "public"."brotmon_owned_moves" to "authenticated";

grant trigger on table "public"."brotmon_owned_moves" to "authenticated";

grant truncate on table "public"."brotmon_owned_moves" to "authenticated";

grant update on table "public"."brotmon_owned_moves" to "authenticated";

grant delete on table "public"."brotmon_owned_moves" to "service_role";

grant insert on table "public"."brotmon_owned_moves" to "service_role";

grant references on table "public"."brotmon_owned_moves" to "service_role";

grant select on table "public"."brotmon_owned_moves" to "service_role";

grant trigger on table "public"."brotmon_owned_moves" to "service_role";

grant truncate on table "public"."brotmon_owned_moves" to "service_role";

grant update on table "public"."brotmon_owned_moves" to "service_role";


