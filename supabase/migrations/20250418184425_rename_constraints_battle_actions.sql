alter table "public"."battle_turns" drop constraint "battle_turn_host_action_id_fkey";

alter table "public"."battle_turns" drop constraint "battle_turn_guest_action_id_fkey";

alter table "public"."battle_actions" drop constraint "battle_states_battle_id_fkey";

alter table "public"."battle_actions" drop constraint "battle_states_brotmon_id_fkey";

alter table "public"."battle_actions" drop constraint "battle_states_trainer_id_fkey";

alter table "public"."battle_actions" drop constraint "battle_states_pkey";

drop index if exists "public"."battle_states_pkey";

CREATE UNIQUE INDEX battle_actions_pkey ON public.battle_actions USING btree (id);

alter table "public"."battle_actions" add constraint "battle_actions_pkey" PRIMARY KEY using index "battle_actions_pkey";

alter table "public"."battle_actions" add constraint "battle_actions_battle_id_fkey" FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE not valid;

alter table "public"."battle_actions" validate constraint "battle_actions_battle_id_fkey";

alter table "public"."battle_actions" add constraint "battle_actions_brotmon_id_fkey" FOREIGN KEY (brotmon_id) REFERENCES trainer_brotmons(id) not valid;

alter table "public"."battle_actions" validate constraint "battle_actions_brotmon_id_fkey";

alter table "public"."battle_actions" add constraint "battle_actions_trainer_id_fkey" FOREIGN KEY (trainer_id) REFERENCES trainers(id) not valid;

alter table "public"."battle_actions" validate constraint "battle_actions_trainer_id_fkey";

alter table "public"."battle_turns" add constraint "battle_turn_host_action_id_fkey" FOREIGN KEY (host_action_id) REFERENCES battle_actions(id) not valid;

alter table "public"."battle_turns" validate constraint "battle_turn_host_action_id_fkey";

alter table "public"."battle_turns" add constraint "battle_turn_guest_action_id_fkey" FOREIGN KEY (guest_action_id) REFERENCES battle_actions(id) not valid;

alter table "public"."battle_turns" validate constraint "battle_turn_guest_action_id_fkey";