import { RoleBattle } from "@/hooks/use-battle-connection";
import { StatusEffect, StatusEffectEnum } from "@/types/old/move.type";
import { Progress } from "../ui/progress";

type BattleRenderProps = {
  battle: RoleBattle;
};

const getHealth = (base: number, current: number) => {
  return (current / base) * 100;
};

const getStatusColor = (type: StatusEffectEnum): string => {
  switch (type) {
    case StatusEffectEnum.PARALYZE:
      return "bg-yellow-200 text-yellow-800";
    case StatusEffectEnum.SLEEP:
      return "bg-blue-200 text-blue-800";
    case StatusEffectEnum.BRAINROT:
      return "bg-pink-200 text-pink-800";
    case StatusEffectEnum.POISON:
      return "bg-purple-200 text-purple-800";
    case StatusEffectEnum.BURN:
      return "bg-red-200 text-red-800";
    default:
      return "";
  }
};

const EffectsList = ({ effects }: { effects: StatusEffect[] }) => {
  return (
    <div className="flex w-1/2 flex-wrap items-center gap-1">
      {effects.map((effect, index) => {
        if (
          effect.type === StatusEffectEnum.BUFF ||
          effect.type === StatusEffectEnum.DEBUFF
        ) {
          return Object.entries(effect.modifiers || {}).map(([stat, value]) => (
            <div
              key={`${effect.name}-${stat}-${index}`}
              className={`rounded px-2 py-1 text-sm ${
                value > 0
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {stat.slice(0, 3)} {value > 0 ? "+" : ""}
              {value * 100}%
            </div>
          ));
        }

        return (
          <div
            key={effect.name + index}
            className={`rounded px-2 py-1 text-sm ${getStatusColor(effect.type)}`}
          >
            {effect.type.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};

export function BattleRender({ battle }: BattleRenderProps) {
  const trainer = battle.trainers[battle.role]!;
  const opponent = battle.trainers[1 - battle.role]!;

  const tBrotmon = trainer.brotmons[0];
  const oBrotmon = opponent.brotmons[0];

  return (
    <div className="grid h-full w-full grid-rows-2">
      {/* OPPONENT BROTMON */}
      <div className="flex flex-col items-end justify-center">
        <div className="w-1/2 text-start font-medium">{oBrotmon.name}</div>
        <div className="flex w-1/2 items-center gap-2">
          <Progress value={getHealth(oBrotmon.max_hp, oBrotmon.current_hp)} />
          <div>
            {oBrotmon.current_hp} / {oBrotmon.max_hp} HP
          </div>
        </div>
        <EffectsList effects={oBrotmon.effects} />
      </div>

      {/* TRAINER BROTMON */}
      <div className="flex flex-col items-start justify-center">
        <div className="w-1/2 text-start font-medium">{tBrotmon.name}</div>
        <div className="flex w-1/2 items-center gap-2">
          <Progress value={getHealth(tBrotmon.max_hp, tBrotmon.current_hp)} />
          <div>
            {tBrotmon.current_hp} / {tBrotmon.max_hp} HP
          </div>
        </div>
        <EffectsList effects={tBrotmon.effects} />
      </div>
    </div>
  );
}
