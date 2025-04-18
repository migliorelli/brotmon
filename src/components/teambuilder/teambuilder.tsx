"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { EmojiPicker } from "../ui/emoji-picker";
import { Input } from "../ui/input";
import { BrotmonSelector } from "./brotmon-selector";

const formSchema = z.object({
  name: z.string().min(3, "Name has to be at least 3 characters loong"),
  emoji: z.string().min(1, "Choose an emoji"),
  brotmons: z
    .array(z.string())
    .min(1, "Chose at least one Brotmon")
    .max(3, "You can only choose 3 Brotmons"),
});

export type TeambuilderData = {
  name: string;
  emoji: string;
  brotmons: string[];
};

type TeambuilderProps = {
  onSubmit: (data: TeambuilderData) => Promise<void>;
  submitButtonText?: string;
};

export function Teambuilder({
  onSubmit,
  submitButtonText = "Create Battle",
}: TeambuilderProps) {
  const [emoji, setEmoji] = useState<string>("🧠");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [brotmons, setBrotmons] = useState<string[]>([]);

  const handleSubmit = () => {
    const data = {
      name,
      emoji,
      brotmons,
    };

    const result = formSchema.safeParse(data);
    if (!result.success) {
      setError(result.error.issues[0].message);
      toast.error(result.error.issues[0].message);
      return;
    }

    onSubmit(data);
  };

  return (
    <div className="h-full w-full">
      <div className="mx-auto flex w-full max-w-sm flex-col space-y-2">
        <div>
          <h4 className="text-xl leading-none font-medium">
            Choose your username
          </h4>
          <p className="text-muted-foreground">
            And an emoji to represent you 😊
          </p>
        </div>
        <div className="flex w-full items-center gap-2">
          <EmojiPicker value={emoji} onChange={(e) => setEmoji(e)} />
          <Input
            value={name}
            className="text-md h-10"
            placeholder="Username"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit}>{submitButtonText}</Button>
        <div className="text-destructive text-center">{error}</div>
      </div>
      <div className="mx-auto w-full max-w-4xl">
        <div className="my-4 w-full">
          <div>
            <h4 className="text-xl leading-none font-medium">
              Choose your team
            </h4>
            <p className="text-muted-foreground">
              You can have a maximum of 3 brotmons 🫢
            </p>
          </div>
          <div></div>
        </div>

        <BrotmonSelector value={brotmons} onChange={(b) => setBrotmons(b)} />
      </div>
    </div>
  );
}
