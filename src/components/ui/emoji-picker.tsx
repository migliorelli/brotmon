"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useTheme } from "next-themes";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const { theme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="size-10 text-center text-2xl">
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-none p-0">
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          theme={theme}
        />
      </PopoverContent>
    </Popover>
  );
}
