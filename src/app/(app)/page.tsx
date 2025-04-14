"use client";

import { Teambuilder, TeambuilderData } from "@/components/teambuilder/teambuilder";
import { httpClient } from "@/lib/http-client";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();

  const handleCreateBattle = async (data: TeambuilderData) => {
    try {
      const response = await httpClient.post("/battle/create", {
        trainer: data,
      });

      if (response.status !== 200)
        throw new AxiosError("Error creating battle", "400");

      const { battleId } = response.data;

      router.push(`/battle/${battleId}`);
    } catch (e) {
      const error = e as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error ?? error.message);
    }
  };

  return (
    <main className="container mx-auto flex flex-col py-8">
      <Teambuilder onSubmit={handleCreateBattle} />
    </main>
  );
}
