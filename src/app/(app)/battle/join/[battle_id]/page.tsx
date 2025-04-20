import { createClient } from "@/lib/supabase/server";
import JoinBattlePage from "@/pages/join-battle-page";

export default async function Page({ params }: { params: Promise<{ battle_id: string }> }) {
  const { battle_id } = await params;

  const supabase = await createClient();
  const { data: brotmons, error } = await supabase.from("brotmons").select("*");

  if (error) {
    console.error("Error fetching Brotmons: ", error);
    throw new Error(error.message);
  }

  return <JoinBattlePage brotmons={brotmons} battle_id={battle_id} />;
}
