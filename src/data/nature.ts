import { Nature } from "@/types/brotmon.type";

export const natureStrengths = {
  [Nature.NORMAL]: [],
  [Nature.FIGHTING]: [Nature.ROCK, Nature.ICE, Nature.NORMAL],
  [Nature.FLYING]: [Nature.FIGHTING, Nature.BUG, Nature.GRASS],
  [Nature.POISON]: [Nature.GRASS],
  [Nature.GROUND]: [Nature.POISON, Nature.ROCK, Nature.FIRE, Nature.ELECTRIC],
  [Nature.ROCK]: [Nature.FLYING, Nature.BUG, Nature.FIRE, Nature.ICE],
  [Nature.BUG]: [Nature.GRASS],
  [Nature.FIRE]: [Nature.BUG, Nature.GRASS, Nature.ICE],
  [Nature.WATER]: [Nature.GROUND, Nature.ROCK, Nature.FIRE],
  [Nature.GRASS]: [Nature.GROUND, Nature.ROCK, Nature.WATER],
  [Nature.ELECTRIC]: [Nature.WATER, Nature.FLYING],
  [Nature.ICE]: [Nature.FLYING, Nature.GROUND, Nature.GRASS],
} as const satisfies Record<Nature, Nature[]>;
