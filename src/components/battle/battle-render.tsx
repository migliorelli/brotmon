import { BattleingBrotmons } from "@/hooks/use-battle-connection";
import { StatusEffect, StatusEffectEnum } from "@/types/status-effect.type";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Spinner } from "../ui/spinner";

type BattleRenderProps = {
  battleingBrotmons: BattleingBrotmons;
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
        if (effect.type === StatusEffectEnum.BUFF || effect.type === StatusEffectEnum.DEBUFF) {
          return Object.entries(effect.modifiers || {}).map(([stat, value]) => (
            <div
              key={`${effect.name}-${stat}-${index}`}
              className={`rounded px-2 py-1 text-sm ${
                value > 0 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
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

export function BattleRender({ battleingBrotmons: { trainer, opponent } }: BattleRenderProps) {
  if (!trainer || !opponent)
    return (
      <div className="flex h-full w-full">
        <Spinner className="m-auto" />
      </div>
    );

  return (
    <Card>
      <CardContent>
        <div className="grid h-full w-full grid-rows-2">
          {/* OPPONENT BROTMON */}
          <div className="flex flex-col items-end justify-center">
            <div className="w-1/2 text-start font-medium">{opponent.base.name}</div>
            <div className="flex w-1/2 items-center gap-2">
              <Progress value={getHealth(opponent.base.hp, opponent.current_hp)} />
              <div>
                {opponent.current_hp} / {opponent.base.hp} HP
              </div>
            </div>
            <EffectsList effects={opponent.effects as StatusEffect[]} />
          </div>

          {/* TRAINER BROTMON */}
          <div className="flex flex-col items-start justify-center">
            <div className="w-1/2 text-start font-medium">{trainer.base.name}</div>
            <div className="flex w-1/2 items-center gap-2">
              <Progress value={getHealth(trainer.base.hp, trainer.current_hp)} />
              <div>
                {trainer.current_hp} / {trainer.base.hp} HP
              </div>
            </div>
            <EffectsList effects={trainer.effects as StatusEffect[]} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
