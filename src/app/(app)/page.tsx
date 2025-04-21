import { HomePage } from "@/components/pages/home-page";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: brotmons, error } = await supabase.from("brotmons").select("*");

  if (error) {
    console.error("Error fetching Brotmons: ", error);
    throw new Error(error.message);
  }

  return <HomePage brotmons={brotmons} />;
}
