import { Brotmon } from "./brotmon.type";

export type Trainer = {
  username: string;
  emoji: string;
  brotmons: Brotmon[]; // up to 3;
};

export type ApiTrainer = {
  username: string;
  emoji: string;
  brotmons: string[]; // up to 3;
};
