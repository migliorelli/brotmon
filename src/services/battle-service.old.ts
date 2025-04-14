import { getSpeedMultipliers } from "@/lib/battle/battle-utils";
import {
  applyStatusEffect,
  calculateDamage,
  processStatusEffect,
} from "@/lib/moves/move-utils";
import {
  Battle,
  BattleAction,
  BattleActionPayload,
  BattleState,
} from "@/types/battle.type";
import { Brotmon } from "@/types/brotmon.type";
import { StatusEffect, StatusEffectEnum } from "@/types/move.type";
import { Trainer } from "@/types/trainer.type";
import { randomUUID } from "crypto";

type RSDC = ReadableStreamDefaultController<Uint8Array>;
type Client = {
  id: string;
  role: 0 | 1; // host | guest
  controller: RSDC | null;
};

/**
 * @deprecated The class should not be used
 */
class OldBattleService {
  private static instance: OldBattleService;
  private clients: Map<string, Map<string, Client>>;
  private battles: Map<string, Battle>;
  private encoder: TextEncoder;

  constructor() {
    this.clients = new Map();
    this.battles = new Map();
    this.encoder = new TextEncoder();
  }

  public static getInstance() {
    if (!OldBattleService.instance) {
      OldBattleService.instance = new OldBattleService();
    }
    return OldBattleService.instance;
  }

  public addClient(battleId: string, id: string, controller: RSDC) {
    const clients = this.clients.get(battleId);
    const client = clients?.get(id);
    const battle = this.battles.get(battleId);

    const data = {
      type: "connection",
      data: { error: false },
    };

    if (!clients || !client || !battle) {
      data.data.error = true;
      this.sendData(controller, data);
      return;
    }

    // change the client controller
    client.controller = controller;

    battle.logs[battle.turn].push({
      date: Date.now(),
      message: `${battle.trainers[client.role]} connected!`,
    });

    // send the connection confirmation
    this.sendData(controller, data);
    // send the battle update
    this.broadcastBattleUpdate(battleId);
  }

  public removeClient(battleId: string, id: string) {
    const clients = this.clients.get(battleId);
    const client = clients?.get(id);

    if (!clients || !client) return;

    client.controller = null;
    let disconnectedCounter = 0;

    clients.forEach((c) => {
      // check if the client is disconnected
      if (c.controller === null) {
        disconnectedCounter++;
      }
    });

    // if both clients are disconnected, delete the battle
    if (disconnectedCounter === 2) {
      this.battles.delete(battleId);
      this.clients.delete(battleId);
      return;
    }

    const battle = this.battles.get(battleId);
    if (!battle) return;

    battle.logs[battle.turn].push({
      date: Date.now(),
      message: `${battle.trainers[client.role]} disconnected!`,
    });

    this.broadcastBattleUpdate(battleId);
  }

  public createBattle(hostTrainer: Trainer) {
    const battleId = randomUUID();
    const id = randomUUID();

    const battle: Battle = {
      id: battleId,
      trainers: [hostTrainer, null],
      moves: [null, null],
      turn: 0,
      logs: [
        [
          {
            date: Date.now(),
            message: `${hostTrainer.username} created the battle ${battleId}!`,
          },
        ],
      ],
      state: BattleState.WAITING,
      winner: -1,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    // create the battle
    this.battles.set(battleId, battle);
    this.clients.set(battleId, new Map());

    // add the host to the battle
    const clients = this.clients.get(battleId)!;
    clients.set(id, { id, role: 0, controller: null });

    return { id, battleId };
  }

  public joinBattle(battleId: string, trainer: Trainer) {
    const battle = this.battles.get(battleId);
    const clients = this.clients.get(battleId);

    // check if the battle and clients exists,
    // if the battle is waiting and if the battle has less than 2 joined
    if (
      !battle ||
      !clients ||
      battle.state !== BattleState.WAITING ||
      clients.size >= 2
    ) {
      return null;
    }

    const id = randomUUID();
    clients.set(id, { id, role: 1, controller: null });

    battle.trainers[1] = trainer;
    battle.state = BattleState.READY;
    battle.lastUpdated = Date.now();
    battle.logs[battle.turn].push({
      date: Date.now(),
      message: `${trainer.username} joined the battle!`,
    });

    this.broadcastBattleUpdate(battleId);
    return { id };
  }

  public startBattle(battleId: string): Battle | null {
    const battle = this.battles.get(battleId);
    if (!battle || battle.state !== BattleState.READY) {
      return null;
    }

    battle.state = BattleState.BATTLEING;
    battle.lastUpdated = Date.now();
    battle.logs[battle.turn].push({
      date: Date.now(),
      message: `The battle has started!`,
    });

    this.broadcastBattleUpdate(battleId);
    return battle;
  }

  public performAction(
    battleId: string,
    trainerRole: 0 | 1,
    data: BattleActionPayload,
  ): Battle | null {
    const battle = this.battles.get(battleId);
    if (!battle) {
      return null;
    }

    // if the battle is ready, the trainer is host and the action is start
    if (
      BattleState.READY === battle.state &&
      BattleAction.START === data.action &&
      trainerRole === 0
    ) {
      this.startBattle(battleId);
    }

    // if is not battling return null
    if (BattleState.BATTLEING !== battle.state) {
      return null;
    }

    const { trainers } = battle;
    if (!trainers[0] || !trainers[1]) return null;

    if (BattleAction.FORFEIT === data.action) {
      const deletedBattle = this.handleForfeit(battle, trainerRole);
      return deletedBattle;
    }

    battle.moves[trainerRole] = data;

    const executeTurn = battle.moves.every((m) => m !== null);
    if (executeTurn) {
      const [attackerSpeed, targetSpeed] = [
        trainers[0].brotmons[0].speed,
        trainers[1].brotmons[0].speed,
      ];

      const [attackerSpeedMultiplier, targetSpeedMultiplier] =
        getSpeedMultipliers(trainers[0].brotmons[0], trainers[1].brotmons[0]);

      // if hostSpeed < guestSpeed then Number(boolean) will be 1, the guest index
      const first = Number(
        attackerSpeed * attackerSpeedMultiplier <
          targetSpeed * targetSpeedMultiplier,
      );

      for (let i = 0; i < 2; i++) {
        const attackerIndex = ((first + i) % 2) as 0 | 1;
        const attacker = trainers[attackerIndex]!;
        const target = trainers[1 - attackerIndex]!;

        const attackerBrotmon = attacker.brotmons[0];
        const targetBrotmon = target.brotmons[0];
        const move = battle.moves[attackerIndex];

        if (!move || !attackerBrotmon || !targetBrotmon) return null;

        let canMove = this.handleInterruptiveEffects(battle, attackerBrotmon);
        if (canMove) {
          switch (move.action) {
            case BattleAction.MOVE:
              this.handleMove(
                battle,
                attackerBrotmon,
                targetBrotmon,
                (move as any).moveIndex,
              );
              break;
            case BattleAction.SWITCH:
              this.handleSwitch(battle, attacker, (move as any).brotmonIndex);
              break;
          }
        }
      }

      // process the Brotmon status
      for (let i = 0; i < 2; i++) {
        const brotmon = trainers[i]?.brotmons[0];
        if (!brotmon) return null;

        const date = Date.now();
        const statusLogs = processStatusEffect(brotmon);
        statusLogs.forEach((log) => {
          battle.logs[battle.turn].push({
            date,
            message: log,
          });
        });
      }

      // check if some Brotmon is fainted
      for (let i = 0; i < 2; i++) {
        const trainer = trainers[i];
        if (!trainer) return null;

        const brotmon = trainer.brotmons[0];
        // check if Brotmon is dead
        if (brotmon.current_hp <= 0) {
          brotmon.current_hp = 0;
          battle.logs[battle.turn].push({
            date: Date.now(),
            message: `${brotmon.name} fainted!`,
          });

          // check if the target lost
          const aliveBrotmons = trainer.brotmons.filter(
            (b) => b.current_hp > 0,
          );

          if (aliveBrotmons.length === 0) {
            battle.state = BattleState.FINISHED;
            battle.winner = i as 0 | 1;
            battle.logs[battle.turn].push({
              date: Date.now(),
              message: `${trainer.username} won the battle!`,
            });
          } else {
            // if the pokemon is fainted and the defender didn't lost, switch to the next Brotmon
            this.autoSwitchBrotmon(battle, trainer);
          }
        }
      }

      battle.turn++;
    }

    battle.lastUpdated = Date.now();
    this.broadcastBattleUpdate(battleId);
    return battle;
  }

  private handleMove(
    battle: Battle,
    attackerBrotmon: Brotmon,
    targetBrotmon: Brotmon,
    moveIndex: number,
  ): void {
    const move = attackerBrotmon.moves[moveIndex];
    if (!move || move.uses <= 0) {
      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${attackerBrotmon.name} can't use ${
          move?.name || "that move"
        }!`,
      });
      return;
    }

    move.uses--;

    // execute move, starting with beforeHit
    if (move.beforeHit) {
      move.beforeHit(attackerBrotmon, targetBrotmon);
    }

    // then onHit
    // roll to check if move hits
    const hitDice = Math.random();
    if (hitDice <= move.accuracy) {
      move.onHit(attackerBrotmon, targetBrotmon);

      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${attackerBrotmon.name} used ${move.name}!`,
      });

      // check if it has effect and roll to check if it applies
      if (move.effect && Math.random() <= move.effect.chance) {
        applyStatusEffect(targetBrotmon, move.effect);

        battle.logs[battle.turn].push({
          date: Date.now(),
          message: `${
            targetBrotmon.name
          } got ${move.effect.type.toLowerCase()}!`,
        });
      }
    } else {
      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${attackerBrotmon.name}'s attack missed!`,
      });
    }
  }

  private handleSwitch(
    battle: Battle,
    trainer: Trainer,
    brotmonIndex: number,
  ): void {
    // check if Brotmon exists and if is not already active
    if (brotmonIndex >= trainer.brotmons.length || brotmonIndex === 0) {
      return;
    }

    // check if Brotmon is dead
    if (trainer.brotmons[brotmonIndex].current_hp <= 0) {
      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${trainer.brotmons[brotmonIndex].name} has fainted and cannot battle!`,
      });
      return;
    }

    // swap Brotmons positions
    [trainer.brotmons[0], trainer.brotmons[brotmonIndex]] = [
      trainer.brotmons[brotmonIndex],
      trainer.brotmons[0],
    ];

    battle.logs[battle.turn].push({
      date: Date.now(),
      message: `${trainer.username} switched to ${trainer.brotmons[0].name}!`,
    });
  }

  private handleForfeit(battle: Battle, trainerRole: 0 | 1): Battle | null {
    const trainer = battle.trainers[trainerRole as 0 | 1];
    if (!trainer || !this.battles.has(battle.id)) return null;

    battle.state = BattleState.FINISHED;
    battle.winner = (1 - trainerRole) as 0 | 1;
    battle.logs[battle.turn].push({
      date: Date.now(),
      message: `${trainer.username} forfeited the battle!`,
    });

    const copy = { ...battle };

    this.broadcastBattleUpdate(battle.id);
    this.clients.delete(battle.id);
    this.battles.delete(battle.id);

    return copy;
  }

  private autoSwitchBrotmon(battle: Battle, trainer: Trainer): void {
    // get the first Brotmon alive
    const nextBrotmonIndex = trainer.brotmons.findIndex(
      (b, index) => index > 0 && b.current_hp > 0,
    );

    if (nextBrotmonIndex !== -1) {
      // swap Brotmons positions
      [trainer.brotmons[0], trainer.brotmons[nextBrotmonIndex]] = [
        trainer.brotmons[nextBrotmonIndex],
        trainer.brotmons[0],
      ];

      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${trainer.username} sent out ${trainer.brotmons[0].name}!`,
      });
    }
  }

  private handleInterruptiveEffects(
    battle: Battle,
    attackerBrotmon: Brotmon,
  ): boolean {
    let canMove = true;

    for (let effect of attackerBrotmon.effects) {
      switch (effect.type) {
        case StatusEffectEnum.PARALYZE:
          canMove = this.handleParalysis(battle, attackerBrotmon, effect);
          break;

        case StatusEffectEnum.SLEEP:
          canMove = this.handleSleep(battle, attackerBrotmon, effect);
          break;

        case StatusEffectEnum.BRAINROT:
          canMove = this.handleBrainrot(battle, attackerBrotmon, effect);
          break;
      }

      if (!canMove) break;
    }

    return canMove;
  }

  private handleParalysis(
    battle: Battle,
    attackerBrotmon: Brotmon,
    effect: StatusEffect,
  ): boolean {
    if (Math.random() < 0.25) {
      // 1/4 chance
      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${attackerBrotmon.name} is paralyzed and can't act!`,
      });
      return false;
    }
    return true;
  }

  private handleSleep(
    battle: Battle,
    attackerBrotmon: Brotmon,
    effect: StatusEffect,
  ): boolean {
    if (effect.duration > 0) {
      effect.duration--;
      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${attackerBrotmon.name} is sleeping and can't act!`,
      });
      return false;
    } else {
      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${attackerBrotmon.name} woke up and can act!`,
      });
      return true;
    }
  }

  private handleBrainrot(
    battle: Battle,
    attackerBrotmon: Brotmon,
    effect: StatusEffect,
  ): boolean {
    if (effect.duration > 0) {
      effect.duration--;
      // 1/2 chance
      if (Math.random() < 0.5) {
        const selfDamage = calculateDamage(
          null,
          attackerBrotmon,
          attackerBrotmon,
          true,
        );

        attackerBrotmon.current_hp = Math.max(
          0,
          attackerBrotmon.current_hp - selfDamage,
        );

        battle.logs[battle.turn].push({
          date: Date.now(),
          message: `${attackerBrotmon.name} is brainrot and hurt itself!`,
        });
        return false;
      } else {
        battle.logs[battle.turn].push({
          date: Date.now(),
          message: `${attackerBrotmon.name} overcame the brainrot and can act!`,
        });
        return true;
      }
    } else {
      battle.logs[battle.turn].push({
        date: Date.now(),
        message: `${attackerBrotmon.name} is no longer brainroted!`,
      });
      return true;
    }
  }

  public getBattle(battleId: string): Battle | undefined {
    return this.battles.get(battleId);
  }

  public getAllBattles(): Battle[] {
    return Array.from(this.battles, ([_, value]) => value);
  }

  public sendData(controller: RSDC, data: any): void {
    try {
      controller.enqueue(
        this.encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
      );
    } catch (e) {
      console.error("Error sending data to client:", e);
    }
  }

  public broadcastBattleUpdate(battleId: string): void {
    const battle = this.battles.get(battleId);
    if (!battle) return;

    this.clients.get(battleId)?.forEach((client) => {
      if (!client.controller) return;

      const data = {
        type: "battle:update",
        data: { ...battle, role: client.role },
      };

      this.sendData(client.controller, data);
    });
  }
}

/**
 * @deprecated The service should not be used
 */
const battleService = OldBattleService.getInstance();
export default battleService;
