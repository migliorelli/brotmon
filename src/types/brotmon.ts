export type Multiplier = {
  value: number;
  turns: number;
};

export type BrotmonBase = {
  name: string;
  emoji: string;

  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;
};

export type BrotmonMove = (
  attacker: Brotmon,
  defenser: Brotmon
) => {
  attacker: Brotmon;
  defenser: Brotmon;
};

export type Brotmon = BrotmonBase & {
  id: string;
  hp: number;
  moves: BrotmonMove[];
  attackMultipliers: Multiplier[];
  defenseMultipliers: Multiplier[];
  speedMultipliers: Multiplier[];
  critMultipliers: Multiplier[];
};
