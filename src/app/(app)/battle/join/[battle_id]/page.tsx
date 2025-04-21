import { JoinBattlePage } from "@/components/pages/join-battle-page";
import { createClient } from "@/lib/supabase/server";

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
