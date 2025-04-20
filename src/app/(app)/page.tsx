import { createClient } from "@/lib/supabase/server";
import Homepage from "@/pages/home-page";

export default async function Page() {
  const supabase = await createClient();
  const { data: brotmons, error } = await supabase.from("brotmons").select("*");

  if (error) {
    console.error("Error fetching Brotmons: ", error);
    throw new Error(error.message);
  }

  return <Homepage brotmons={brotmons} />;
}
