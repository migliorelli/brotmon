import { BrotmonBase } from "@/types/brotmon";

// prettier-ignore
export const baseBrotmons: BrotmonBase[] = [
  { name: "Tralalelo Tralala", emoji: "🦈🦵", maxHp: 100, attack: 20, defense: 15, speed: 30, critChance: 0.1 },
  { name: "Bombardiro Crocodilo", emoji: "🐊✈️", maxHp: 120, attack: 25, defense: 20, speed: 18, critChance: 0.05 },
  { name: "Lirili Larila", emoji: "🌵🧚‍♀️", maxHp: 90, attack: 18, defense: 12, speed: 35, critChance: 0.12 },
  { name: "Tung Tung Tung Sahur", emoji: "🪵🥖", maxHp: 110, attack: 22, defense: 18, speed: 22, critChance: 0.08 },
  { name: "Brr Brr Patapim", emoji: "🌲👃", maxHp: 95, attack: 21, defense: 17, speed: 28, critChance: 0.09 },
  { name: "Bombini Guzini", emoji: "🦆✈️", maxHp: 85, attack: 24, defense: 10, speed: 40, critChance: 0.15 },
  { name: "La Vaca Saturno Saturnita", emoji: "🐄🪐", maxHp: 130, attack: 20, defense: 22, speed: 12, critChance: 0.05 },
  { name: "Tripi Tropi Tropa Tripa", emoji: "🐈🦐", maxHp: 105, attack: 23, defense: 14, speed: 25, critChance: 0.1 },
  { name: "Shimpanzinni Bananinni", emoji: "🐒🍌", maxHp: 100, attack: 22, defense: 13, speed: 32, critChance: 0.12 },
  { name: "Trigo Camello Buffo Fardello", emoji: "🐫🌾", maxHp: 115, attack: 19, defense: 21, speed: 15, critChance: 0.06 },
  { name: "Boneca Ambalabu", emoji: "🪆", maxHp: 98, attack: 17, defense: 16, speed: 30, critChance: 0.09 },
  { name: "Capuccino Asassino", emoji: "☕🔪", maxHp: 88, attack: 26, defense: 10, speed: 34, critChance: 0.13 },
  { name: "Burbaloni Loliloni", emoji: "🫧🍭", maxHp: 92, attack: 19, defense: 14, speed: 36, critChance: 0.1 },
  { name: "Trulimero Trulichina", emoji: "🎭", maxHp: 97, attack: 21, defense: 15, speed: 29, critChance: 0.11 },
  { name: "Frulli Frolla", emoji: "🍪", maxHp: 93, attack: 18, defense: 13, speed: 33, critChance: 0.09 },
  { name: "Glorbo", emoji: "👾", maxHp: 120, attack: 24, defense: 20, speed: 20, critChance: 0.1 },
  { name: "Il Cacto Hipopotamo", emoji: "🌵🦛", maxHp: 125, attack: 20, defense: 25, speed: 10, critChance: 0.04 },
  { name: "Cocofanto Elefanto", emoji: "🥥🐘", maxHp: 130, attack: 23, defense: 22, speed: 11, critChance: 0.07 },
  { name: "Crocodildo Penisini", emoji: "🐊🍆", maxHp: 110, attack: 27, defense: 16, speed: 22, critChance: 0.12 },
  { name: "Bananita Dolphinitta", emoji: "🍌🐬", maxHp: 95, attack: 20, defense: 14, speed: 35, critChance: 0.11 },
  { name: "Giraffo Mafioso", emoji: "🦒🕶️", maxHp: 105, attack: 26, defense: 17, speed: 28, critChance: 0.14 },
  { name: "Ecco Cavallo Virtuoso", emoji: "🐎🎻", maxHp: 115, attack: 22, defense: 18, speed: 24, critChance: 0.09 },
  { name: "Biri Brri Bicus Dicus", emoji: "🕊️🤺", maxHp: 90, attack: 25, defense: 12, speed: 38, critChance: 0.13 },
  { name: "Elefanto Morangini", emoji: "🐘🍓", maxHp: 125, attack: 21, defense: 20, speed: 14, critChance: 0.07 },
];

export function getBrotmon(param: string | number): BrotmonBase {
  if (typeof param === "string") {
    return baseBrotmons.find((b) => b.name === param)!;
  } else {
    return baseBrotmons[param];
  }
}
