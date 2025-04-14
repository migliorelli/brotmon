"use client";

import { Teambuilder, TeambuilderData } from "@/components/teambuilder/teambuilder";
import { httpClient } from "@/lib/http-client";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const { battleId } = useParams();
  const router = useRouter();

  const handleJoinBattle = async (data: TeambuilderData) => {
    try {
      const response = await httpClient.post(`/battle/${battleId}/join`, {
        trainer: data,
      });

      if (response.status !== 200)
        throw new AxiosError("Error joining battle", "400");

      router.push(`/battle/${battleId}/`);
    } catch (e) {
      const error = e as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error ?? error.message);
    }
  };

  return (
    <main className="container mx-auto flex flex-col py-8">
      <Teambuilder onSubmit={handleJoinBattle} />
    </main>
  );
}
