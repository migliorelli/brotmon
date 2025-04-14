import {
  createAttackMove,
  createBuffMove,
  createDebuffMove,
  createStatusMove,
} from "@/lib/moves/moves-factory";
import { Nature } from "@/types/old/brotmon.type";
import { StatusEffectEnum } from "@/types/old/move.type";

export const moves = {
  [Nature.NORMAL]: {
    tackle: createAttackMove("Tackle", Nature.NORMAL, 40, null, false, 100, 25),
    quickStrike: createAttackMove(
      "Quick Strike",
      Nature.NORMAL,
      40,
      null,
      false,
      95,
      20,
      10,
    ),
    headbutt: createAttackMove(
      "Headbutt",
      Nature.NORMAL,
      65,
      {
        type: StatusEffectEnum.BRAINROT,
        chance: 0.2,
        duration: 4,
      },
      false,
      0.9,
      15,
    ),
    psychicBlast: createAttackMove(
      "Psychic Blast",
      Nature.NORMAL,
      80,
      null,
      false,
      0.85,
      10,
    ),
    ironDefense: createBuffMove(
      "Iron Defense",
      Nature.NORMAL,
      { defense: 0.4 },
      1,
      5,
    ),
    weakenDefense: createDebuffMove(
      "Weaken Defense",
      Nature.NORMAL,
      { defense: -0.3 },
      3,
      15,
      0,
    ),
    mindControl: createDebuffMove(
      "Mind Control",
      Nature.NORMAL,
      { attack: -0.3, speed: -0.2 },
      2,
      15,
      0,
    ),
    mentalBreakdown: createDebuffMove(
      "Mental Breakdown",
      Nature.NORMAL,
      { attack: -0.4, speed: -0.3 },
      3,
      10,
      0,
    ),
    brainrot: createStatusMove(
      "Brainrot",
      Nature.NORMAL,
      {
        type: StatusEffectEnum.BRAINROT,
        chance: 1,
        duration: 4,
      },
      1,
      10,
    ),
  },

  [Nature.FIRE]: {
    bombardiroMissille: createAttackMove(
      "Bombardiro Missile",
      Nature.FIRE,
      110,
      {
        type: StatusEffectEnum.BURN,
        chance: 0.3,
        duration: 2,
      },
      false,
      0.7,
      5,
    ),
    atomicBomb: createAttackMove(
      "Atomic Bomb",
      Nature.FIRE,
      125,
      {
        type: StatusEffectEnum.POISON,
        chance: 0.1,
        duration: 3,
      },
      false,
      0.7,
      5,
    ),
    flameBurst: createAttackMove(
      "Flame Burst",
      Nature.FIRE,
      70,
      {
        type: StatusEffectEnum.BURN,
        chance: 0.11,
        duration: 2,
      },
      false,
      1,
      10,
    ),
  },

  [Nature.WATER]: {
    tralaleroBlast: createAttackMove(
      "Tralalero Blast",
      Nature.WATER,
      75,
      {
        type: StatusEffectEnum.BRAINROT,
        chance: 0.5,
        duration: 4,
      },
      false,
      0.85,
    ),
    waterPulse: createAttackMove(
      "Water Pulse",
      Nature.WATER,
      60,
      null,
      false,
      0.95,
      15,
    ),
    bubbleBeam: createAttackMove(
      "Bubble Beam",
      Nature.WATER,
      70,
      null,
      false,
      0.9,
      15,
    ),
  },

  [Nature.GRASS]: {
    bananaSlip: createAttackMove(
      "Banana Slip",
      Nature.GRASS,
      110,
      {
        type: StatusEffectEnum.BRAINROT,
        chance: 0.4,
        duration: 4,
      },
      false,
      0.8,
      15,
    ),
    coconutBomb: createAttackMove(
      "Coconut Bomb",
      Nature.GRASS,
      70,
      null,
      false,
      0.9,
      15,
    ),
    vineWhip: createAttackMove("Vine Whip", Nature.GRASS, 70),
    leafBlade: createAttackMove("Leaf Blade", Nature.GRASS, 80),
    leafStorm: createAttackMove("Leaf Storm", Nature.GRASS, 70),
  },

  [Nature.ELECTRIC]: {
    thunderShock: createAttackMove(
      "Thunder Shock",
      Nature.ELECTRIC,
      40,
      {
        type: StatusEffectEnum.PARALYZE,
        chance: 0.2,
        duration: 4,
      },
      false,
      0.95,
      20,
    ),
    electricShock: createAttackMove(
      "Electric Shock",
      Nature.ELECTRIC,
      75,
      {
        type: StatusEffectEnum.PARALYZE,
        chance: 0.3,
        duration: 4,
      },
      false,
      0.85,
      10,
    ),
    shockWave: createAttackMove(
      "Shock Wave",
      Nature.ELECTRIC,
      80,
      {
        type: StatusEffectEnum.PARALYZE,
        chance: 0.2,
        duration: 4,
      },
      false,
      0.8,
      10,
    ),
  },

  [Nature.ICE]: {
    icyWind: createAttackMove("Icy Wind", Nature.ICE, 50, null, false, 1, 20),
    iceBeam: createAttackMove("Ice Beam", Nature.ICE, 70, null, false, 0.9, 10),
    icePunch: createAttackMove(
      "Ice Punch",
      Nature.ICE,
      60,
      null,
      false,
      0.9,
      15,
    ),
  },

  [Nature.FIGHTING]: {
    discombobulate: createAttackMove(
      "Discombobulate",
      Nature.FIGHTING,
      50,
      {
        type: StatusEffectEnum.BRAINROT,
        chance: 1,
        duration: 4,
      },
      false,
      0.7,
      5,
    ),
    flyingKick: createAttackMove(
      "Flying Kick",
      Nature.FIGHTING,
      85,
      null,
      false,
      0.85,
      10,
    ),
    adrenalineRush: createBuffMove(
      "Adrenaline Rush",
      Nature.FIGHTING,
      { speed: 2 },
      4,
      5,
    ),
    powerUp: createBuffMove(
      "Power Up",
      Nature.FIGHTING,
      { attack: 0.2, defense: 0.2 },
      2,
      20,
    ),
  },

  [Nature.POISON]: {
    mindBend: createAttackMove(
      "Mind Bend",
      Nature.POISON,
      65,
      {
        type: StatusEffectEnum.POISON,
        chance: 0.3,
        duration: 2,
      },
      false,
      0.8,
      10,
    ),
    poisonSting: createAttackMove("Poison Sting", Nature.POISON, 50),
    poisonGas: createAttackMove(
      "Poison Gas",
      Nature.POISON,
      70,
      {
        type: StatusEffectEnum.POISON,
        chance: 0.2,
        duration: 3,
      },
      false,
      0.8,
      10,
    ),
  },

  [Nature.ROCK]: {
    rockThrow: createAttackMove(
      "Rock Throw",
      Nature.ROCK,
      65,
      null,
      false,
      0.9,
      15,
    ),
    rockSlide: createAttackMove(
      "Rock Slide",
      Nature.ROCK,
      75,
      null,
      false,
      0.8,
      10,
    ),
    rockSmash: createAttackMove("Rock Smash", Nature.ROCK, 85),
    atomicBlast: createAttackMove(
      "Meteor",
      Nature.ROCK,
      120,
      null,
      false,
      0.8,
      5,
    ),
  },

  [Nature.FLYING]: {
    wingAttack: createAttackMove(
      "Wing Attack",
      Nature.FLYING,
      60,
      null,
      false,
      0.95,
      15,
    ),
    fly: createBuffMove("Fly", Nature.FLYING, { speed: 2 }, 4, 5),
    acrobatics: createAttackMove(
      "Acrobatics",
      Nature.FLYING,
      50,
      {
        chance: 0.2,
        type: StatusEffectEnum.BUFF,
        duration: 2,
        modifiers: {
          speed: 0.5,
        },
      },
      false,
      1,
      15,
      1,
    ),
  },

  [Nature.GROUND]: {
    earthquake: createAttackMove(
      "Earthquake",
      Nature.GROUND,
      100,
      {
        type: StatusEffectEnum.BRAINROT,
        chance: 0.1,
        duration: 4,
      },
      false,
      0.7,
      5,
    ),
    mudSlap: createAttackMove("Mud Slap", Nature.GROUND, 55),
    sandAttack: createAttackMove(
      "Sand Attack",
      Nature.GROUND,
      60,
      null,
      false,
      0.9,
      15,
    ),
  },

  [Nature.BUG]: {
    bugBite: createAttackMove("Bug Bite", Nature.BUG, 60),
  },
};

export const availableMoves = Object.values(moves).reduce(
  (acc, natureMoves) => ({ ...acc, ...natureMoves }),
  {},
);
