"use client";

import { BrotmonItem } from "@/components/teambuilder/brotmon-selector";
import { Teambuilder, TeambuilderData } from "@/components/teambuilder/teambuilder";
import { httpClient } from "@/lib/http-client";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type JoinBattlePageProps = {
  brotmons: BrotmonItem[];
  battle_id: string;
};

export function JoinBattlePage({ brotmons, battle_id }: JoinBattlePageProps) {
  const router = useRouter();

  const handleJoinBattle = async (data: TeambuilderData) => {
    try {
      const response = await httpClient.post(`/battle/${battle_id}/join`, {
        trainer: data,
      });

      if (response.status !== 200) throw new AxiosError("Error joining battle", "400");

      router.push(`/battle/${battle_id}/`);
    } catch (e) {
      const error = e as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error ?? error.message);
    }
  };

  return (
    <main className="container mx-auto flex flex-col py-8">
      <Teambuilder
        brotmons={brotmons}
        onSubmit={handleJoinBattle}
        submitButtonText="🕹️ Join battle"
      />
    </main>
  );
}
