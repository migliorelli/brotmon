"use client";

import { usePersistentState } from "@/hooks/use-persistent-state";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { EmojiPicker } from "../ui/emoji-picker";
import { Input } from "../ui/input";
import { BrotmonItem, BrotmonSelector } from "./brotmon-selector";

const formSchema = z.object({
  username: z.string().min(3, "Name has to be at least 3 characters loong"),
  emoji: z.string().min(1, "Choose an emoji"),
  brotmons: z
    .array(z.string())
    .min(1, "Chose at least one Brotmon")
    .max(3, "You can only choose 3 Brotmons"),
});

export type TeambuilderData = {
  username: string;
  emoji: string;
  brotmons: string[];
};

type TeambuilderProps = {
  onSubmit: (data: TeambuilderData) => Promise<void>;
  brotmons: BrotmonItem[];
  submitButtonText?: string;
};

export function Teambuilder({
  brotmons,
  onSubmit,
  submitButtonText = "🕹️ Create Battle",
}: TeambuilderProps) {
  const [emoji, setEmoji] = usePersistentState<string>("tb_emoji", "🧠");
  const [username, setUsername] = usePersistentState("tb_username", "");
  const [team, setTeam] = usePersistentState<string[]>("tb_team", []);
  const [error, setError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const handleSubmit = () => {
    const data = {
      username,
      emoji,
      brotmons: team,
    };

    const result = formSchema.safeParse(data);
    if (!result.success) {
      const errorMessage = `${result.error.issues[0].path}: ${result.error.issues[0].message}`;
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    onSubmit(data);
  };

  useEffect(() => {
    const isTeamValid = team.every((b) => brotmons.some((b2) => b2.id === b));
    if (!isTeamValid) setTeam([]);

    setValidated(true);
  }, [team, brotmons]);

  if (!validated) return null;

  return (
    <div className="h-full w-full px-4">
      <div className="mx-auto flex w-full max-w-sm flex-col space-y-2">
        <div>
          <h4 className="text-xl leading-none font-medium">Choose your username</h4>
          <p className="text-muted-foreground">And an emoji to represent you 😊</p>
        </div>
        <div className="flex w-full items-center gap-2">
          <EmojiPicker value={emoji} onChange={(e) => setEmoji(e)} />
          <Input
            value={username}
            className="text-md h-10"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit}>{submitButtonText}</Button>
        <div className="text-destructive text-center">{error}</div>
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <div className="my-4 w-full">
          <div>
            <h4 className="text-xl leading-none font-medium">Choose your team</h4>
            <p className="text-muted-foreground">You can have a maximum of 3 brotmons 🫢</p>
          </div>
          <div></div>
        </div>

        <BrotmonSelector brotmons={brotmons} value={team} onChange={(b) => setTeam(b)} />
      </div>
    </div>
  );
}
