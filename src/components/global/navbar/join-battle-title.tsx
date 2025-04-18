"use client";

import { usePathname } from "next/navigation";

export function JoinBattleTitle() {
  const pathname = usePathname();
  const isJoinBattlePage = pathname.startsWith("/battle/join/");
  const battle_id = pathname.split("/").at(-1);

  if (!isJoinBattlePage) return null;

  return (
    <div className="my-auto text-center justify-self-center">
      <h1 className="text-lg md:text-xl font-bold">Join Battle</h1>
      <p className="text-muted-foreground text-sm">Battle ID: {battle_id}</p>
    </div>
  );
}
