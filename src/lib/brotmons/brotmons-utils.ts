import { availableBrotmons } from "@/data/brotmons";
import { Brotmon } from "@/types/old/brotmon.type";
import { ApiTrainer, Trainer } from "@/types/old/trainer.type";

export function convertTrainer(apiTrainer: ApiTrainer): Trainer {
  return {
    ...apiTrainer,
    brotmons: apiTrainer.brotmons.map((brotmon) => {
      const brotmonData =
        availableBrotmons[brotmon as keyof typeof availableBrotmons];

      return {
        ...brotmonData,
        current_attack: brotmonData.attack,
        current_defense: brotmonData.defense,
        current_hp: brotmonData.max_hp,
        current_speed: brotmonData.speed,
        effects: [],
      } as Brotmon;
    }),
  };
}
