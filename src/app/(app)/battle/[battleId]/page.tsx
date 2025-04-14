import { BattlePage } from "@/components/battle/battle-page";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ battleId: string }>;
}) {
  const cookieStore = await cookies();
  const id = cookieStore.get("id")?.value;
  const { battleId } = await params;

  if (!id || !battleId) {
    notFound();
  }

  return <BattlePage battleId={battleId} id={id} />;
}
