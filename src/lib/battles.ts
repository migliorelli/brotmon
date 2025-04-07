import { v4 as uuidv4 } from "uuid";
import { getBrotmon } from "./brotmons";
import { Battle, BattleState, TrainerEnum } from "@/types/battle";
import { Trainer } from "@/types/trainer";
import { Brotmon } from "@/types/brotmon";

const battles: Map<string, Battle> = new Map();

export function getBattle(id: string): Battle | undefined {
  return battles.get(id);
}

export function createBattle(
  trainerName: string,
  trainerEmoji: string,
  trainerBrotmon: string
): Battle {
  const brotmonBase = getBrotmon(trainerBrotmon);

  const brotmon: Brotmon = {
    ...brotmonBase,
    id: uuidv4(),
    hp: brotmonBase.maxHp,
    attackMultipliers: [],
    defenseMultipliers: [],
    speedMultipliers: [],
    critMultipliers: [],
    moves: [],
  };

  const trainer: Trainer = {
    name: trainerName,
    emoji: trainerEmoji,
    brotmon,
  };

  const battle: Battle = {
    id: uuidv4(),
    host: trainer,
    guest: null,
    turn: 0,

    log: [`Battle waiting for guest opponent...`],
    state: BattleState.WAITING,
    winner: TrainerEnum.NONE,

    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };

  battles.set(battle.id, battle);

  return battle;
}
