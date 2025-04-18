"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useId, useState } from "react";

export function JoinBattlePopover() {
  const id = useId();
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    console.log("submit", value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="border-0 shadow-none dark:bg-transparent"
        >
          Join Battle
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-2">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Join Battle</h4>
            <p className="text-muted-foreground text-sm">
              Enter the battle ID to join.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id={id}
              placeholder="abdc-efgh-ijkl-mnop"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8"
            />
            <Button className="h-8" onClick={handleSubmit}>
              Join
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
