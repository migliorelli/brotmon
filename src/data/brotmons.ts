import { BrotmonBase, Nature } from "@/types/old/brotmon.type";
import { moves } from "./moves";

export const availableBrotmons: Record<string, BrotmonBase> = {
  "tralalero-tralala": {
    id: "tralalero-tralala",
    name: "Tralalelo Tralala",
    emoji: "🦈🦵",
    nature: [Nature.GROUND, Nature.WATER],
    max_hp: 100,
    attack: 20,
    defense: 15,
    speed: 30,
    moves: [
      moves.NORMAL.quickStrike,
      moves.NORMAL.brainrot,
      moves.ICE.icyWind,
      moves.WATER.tralaleroBlast,
    ],
  },
  "bombardiro-crocodilo": {
    id: "bombardiro-crocodilo",
    name: "Bombardiro Crocodilo",
    emoji: "🐊✈️",
    nature: [Nature.FLYING, Nature.FIRE],
    max_hp: 100,
    attack: 25,
    defense: 20,
    speed: 18,
    moves: [
      moves.NORMAL.quickStrike,
      moves.FIRE.bombardiroMissille,
      moves.FIRE.atomicBomb,
      moves.FLYING.wingAttack,
    ],
  },
  "lirili-larila": {
    id: "lirili-larila",
    name: "Lirili Larila",
    emoji: "🌵🐘",
    nature: [Nature.GROUND, Nature.GRASS],
    max_hp: 120,
    attack: 18,
    defense: 12,
    speed: 35,
    moves: [
      moves.NORMAL.tackle,
      moves.GROUND.earthquake,
      moves.GRASS.coconutBomb,
      moves.GRASS.leafBlade,
    ],
  },
  "tung-tung-tung-sahur": {
    id: "tung-tung-tung-sahur",
    name: "Tung Tung Tung Sahur",
    emoji: "🪵🥖",
    nature: [Nature.FIGHTING],
    max_hp: 110,
    attack: 22,
    defense: 18,
    speed: 22,
    moves: [
      moves.NORMAL.tackle,
      moves.FIGHTING.powerUp,
      moves.FIGHTING.flyingKick,
      moves.ROCK.atomicBlast,
    ],
  },
  "brr-brr-patapim": {
    id: "brr-brr-patapim",
    name: "Brr Brr Patapim",
    emoji: "🌲👃",
    nature: [Nature.GRASS],
    max_hp: 95,
    attack: 21,
    defense: 17,
    speed: 28,
    moves: [
      moves.NORMAL.tackle,
      moves.GRASS.leafBlade,
      moves.GRASS.vineWhip,
      moves.POISON.mindBend,
    ],
  },
  "bombini-guzini": {
    id: "bombini-guzini",
    name: "Bombini Guzini",
    emoji: "🦆✈️",
    nature: [Nature.FLYING, Nature.WATER],
    max_hp: 85,
    attack: 24,
    defense: 10,
    speed: 40,
    moves: [
      moves.NORMAL.tackle,
      moves.WATER.waterPulse,
      moves.WATER.bubbleBeam,
      moves.ICE.iceBeam,
    ],
  },
  "la-vaca-saturno-saturnita": {
    id: "la-vaca-saturno-saturnita",
    name: "La Vaca Saturno Saturnita",
    emoji: "🐄🪐",
    nature: [Nature.NORMAL, Nature.FLYING],
    max_hp: 130,
    attack: 20,
    defense: 22,
    speed: 12,
    moves: [
      moves.NORMAL.tackle,
      moves.FLYING.wingAttack,
      moves.NORMAL.headbutt,
      moves.FLYING.fly,
    ],
  },
  "tripi-tropi-tropa-tripa": {
    id: "tripi-tropi-tropa-tripa",
    name: "Tripi Tropi Tropa Tripa",
    emoji: "🐈🦐",
    nature: [Nature.WATER, Nature.NORMAL],
    max_hp: 105,
    attack: 23,
    defense: 14,
    speed: 25,
    moves: [
      moves.NORMAL.tackle,
      moves.WATER.waterPulse,
      moves.WATER.bubbleBeam,
      moves.NORMAL.quickStrike,
    ],
  },
  "shimpanzinni-bananinni": {
    id: "shimpanzinni-bananinni",
    name: "Shimpanzinni Bananinni",
    emoji: "🐒🍌",
    nature: [Nature.FIGHTING, Nature.GROUND],
    max_hp: 100,
    attack: 22,
    defense: 13,
    speed: 32,
    moves: [
      moves.NORMAL.tackle,
      moves.GRASS.bananaSlip,
      moves.FIGHTING.flyingKick,
      moves.GROUND.mudSlap,
    ],
  },
  "trigo-camello-buffo-fardello": {
    id: "trigo-camello-buffo-fardello",
    name: "Trigo Camello Buffo Fardello",
    emoji: "🐫🌾",
    nature: [Nature.GROUND, Nature.ROCK],
    max_hp: 115,
    attack: 19,
    defense: 21,
    speed: 15,
    moves: [
      moves.NORMAL.tackle,
      moves.GROUND.earthquake,
      moves.ROCK.rockThrow,
      moves.ROCK.rockSmash,
    ],
  },
  "boneca-ambalabu": {
    id: "boneca-ambalabu",
    name: "Boneca Ambalabu",
    emoji: "🪆",
    nature: [Nature.WATER],
    max_hp: 98,
    attack: 17,
    defense: 16,
    speed: 30,
    moves: [
      moves.NORMAL.tackle,
      moves.WATER.waterPulse,
      moves.NORMAL.ironDefense,
      moves.WATER.bubbleBeam,
    ],
  },
  "capuccino-asassino": {
    id: "capuccino-asassino",
    name: "Capuccino Asassino",
    emoji: "☕🔪",
    nature: [Nature.NORMAL, Nature.ICE],
    max_hp: 88,
    attack: 26,
    defense: 10,
    speed: 34,
    moves: [
      moves.NORMAL.tackle,
      moves.ICE.iceBeam,
      moves.NORMAL.quickStrike,
      moves.ICE.icyWind,
    ],
  },
  "burbaloni-loliloni": {
    id: "burbaloni-loliloni",
    name: "Burbaloni Loliloni",
    emoji: "🫧🍭",
    nature: [Nature.NORMAL],
    max_hp: 92,
    attack: 19,
    defense: 14,
    speed: 36,
    moves: [
      moves.NORMAL.tackle,
      moves.NORMAL.quickStrike,
      moves.NORMAL.mentalBreakdown,
      moves.NORMAL.brainrot,
    ],
  },
  "trulimero-trulichina": {
    id: "trulimero-trulichina",
    name: "Trulimero Trulichina",
    emoji: "🎭",
    nature: [Nature.NORMAL, Nature.WATER],
    max_hp: 97,
    attack: 21,
    defense: 15,
    speed: 29,
    moves: [
      moves.NORMAL.tackle,
      moves.WATER.waterPulse,
      moves.NORMAL.mindControl,
      moves.WATER.bubbleBeam,
    ],
  },
  "frulli-frolla": {
    id: "frulli-frolla",
    name: "Frulli Frolla",
    emoji: "🍪",
    nature: [Nature.FLYING],
    max_hp: 93,
    attack: 18,
    defense: 13,
    speed: 33,
    moves: [
      moves.NORMAL.tackle,
      moves.FLYING.wingAttack,
      moves.FLYING.acrobatics,
      moves.FLYING.fly,
    ],
  },
  glorbo: {
    id: "glorbo",
    name: "Glorbo",
    emoji: "👾",
    nature: [Nature.ROCK],
    max_hp: 120,
    attack: 24,
    defense: 20,
    speed: 20,
    moves: [
      moves.NORMAL.tackle,
      moves.ROCK.rockSlide,
      moves.ROCK.atomicBlast,
      moves.ROCK.rockSmash,
    ],
  },
  "il-cacto-hipopotamo": {
    id: "il-cacto-hipopotamo",
    name: "Il Cacto Hipopotamo",
    emoji: "🌵🦛",
    nature: [Nature.GRASS],
    max_hp: 125,
    attack: 20,
    defense: 25,
    speed: 10,
    moves: [
      moves.NORMAL.tackle,
      moves.GRASS.leafBlade,
      moves.GRASS.vineWhip,
      moves.GRASS.coconutBomb,
    ],
  },
  "cocofanto-elefanto": {
    id: "cocofanto-elefanto",
    name: "Cocofanto Elefanto",
    emoji: "🥥🐘",
    nature: [Nature.GRASS],
    max_hp: 130,
    attack: 23,
    defense: 22,
    speed: 11,
    moves: [
      moves.NORMAL.tackle,
      moves.GRASS.leafStorm,
      moves.GRASS.coconutBomb,
      moves.GRASS.bananaSlip,
    ],
  },
  "crocodildo-penisini": {
    id: "crocodildo-penisini",
    name: "Crocodildo Penisini",
    emoji: "🐊🍌",
    nature: [Nature.ELECTRIC],
    max_hp: 110,
    attack: 27,
    defense: 16,
    speed: 22,
    moves: [
      moves.NORMAL.tackle,
      moves.GRASS.bananaSlip,
      moves.ELECTRIC.shockWave,
      moves.ELECTRIC.thunderShock,
    ],
  },
  "bananita-dolphinitta": {
    id: "bananita-dolphinitta",
    name: "Bananita Dolphinitta",
    emoji: "🍌🐬",
    nature: [Nature.GRASS],
    max_hp: 95,
    attack: 20,
    defense: 14,
    speed: 35,
    moves: [
      moves.NORMAL.tackle,
      moves.GRASS.bananaSlip,
      moves.GRASS.leafBlade,
      moves.GRASS.vineWhip,
    ],
  },
  "giraffo-mafioso": {
    id: "giraffo-mafioso",
    name: "Giraffo Mafioso",
    emoji: "🦒🕶️",
    nature: [Nature.ELECTRIC],
    max_hp: 105,
    attack: 26,
    defense: 17,
    speed: 28,
    moves: [
      moves.NORMAL.tackle,
      moves.ELECTRIC.electricShock,
      moves.ELECTRIC.thunderShock,
      moves.NORMAL.headbutt,
    ],
  },
  "ecco-cavallo-virtuoso": {
    id: "ecco-cavallo-virtuoso",
    name: "Ecco Cavallo Virtuoso",
    emoji: "🐎🎻",
    nature: [Nature.ELECTRIC],
    max_hp: 115,
    attack: 22,
    defense: 18,
    speed: 24,
    moves: [
      moves.NORMAL.tackle,
      moves.ELECTRIC.shockWave,
      moves.NORMAL.quickStrike,
      moves.ELECTRIC.thunderShock,
    ],
  },
  "biri-brri-bicus-dicus": {
    id: "biri-brri-bicus-dicus",
    name: "Biri Brri Bicus Dicus",
    emoji: "🕊️🤺",
    nature: [Nature.NORMAL],
    max_hp: 90,
    attack: 25,
    defense: 12,
    speed: 38,
    moves: [
      moves.NORMAL.tackle,
      moves.NORMAL.quickStrike,
      moves.FIGHTING.flyingKick,
      moves.NORMAL.psychicBlast,
    ],
  },
  "elefanto-morangini": {
    id: "elefanto-morangini",
    name: "Elefanto Morangini",
    emoji: "🐘🍓",
    nature: [Nature.GRASS],
    max_hp: 125,
    attack: 21,
    defense: 20,
    speed: 14,
    moves: [
      moves.NORMAL.tackle,
      moves.GRASS.leafBlade,
      moves.GRASS.vineWhip,
      moves.GRASS.coconutBomb,
    ],
  },
};
