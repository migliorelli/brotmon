import { createClient } from "@/lib/supabase/server";
import { BattlePage } from "@/pages/battle-page";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ battle_id: string }>;
}) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const trainer_id = cookieStore.get("trainer_id")?.value;
  const { battle_id } = await params;

  const { data: battle, error } = await supabase
    .from("battles")
    .select("host_id, guest_id")
    .eq("id", battle_id)
    .limit(1);

  if (error) {
    console.error("Error fetching battle: ", error);
    throw new Error(error.message);
  }

  if (!trainer_id || !battle_id || !battle[0]) {
    notFound();
  }

  if (battle[0].host_id !== trainer_id && battle[0].guest_id !== trainer_id) {
    throw new Error("Battle already started");
  }

  return <BattlePage battle_id={battle_id} trainer_id={trainer_id} />;
}
