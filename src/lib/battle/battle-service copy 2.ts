import { createClient } from '@supabase/supabase-js';
import { Battle, BattleAction, BattleActionPayload, BattleState } from '@/types/old/battle.type';
import { Brotmon } from '@/types/old/brotmon.type';
import { Trainer } from '@/types/old/trainer.type';
import { StatusEffect, StatusEffectEnum } from '@/types/old/move.type';
import { calculateDamage, applyStatusEffect, processStatusEffect } from '../moves/move-utils';
import { getSpeedMultipliers } from './battle-utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class BattleService {
  private static instance: BattleService;
  private supabase: ReturnType<typeof createClient>;

  private constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  public static getInstance() {
    if (!BattleService.instance) {
      BattleService.instance = new BattleService();
    }
    return BattleService.instance;
  }

  // Métodos para treinadores
  public async getTrainer(userId: string): Promise<Trainer | null> {
    const { data, error } = await this.supabase
      .from('trainers')
      .select('*, trainer_brotmons:trainer_brotmons(*, brotmon:brotmons(*, moves:moves(*)))')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      name: data.name,
      emoji: data.emoji,
      brotmons: data.trainer_brotmons.map(tb => ({
        ...tb.brotmon,
        current_hp: tb.current_hp,
        current_attack: tb.current_attack,
        current_defense: tb.current_defense,
        current_speed: tb.current_speed,
        effects: tb.effects || []
      }))
    };
  }

  public async createTrainer(userId: string, name: string, emoji: string): Promise<Trainer | null> {
    const { data, error } = await this.supabase
      .from('trainers')
      .insert([{ user_id: userId, name, emoji }])
      .select('*')
      .single();

    return error ? null : this.getTrainer(userId);
  }

  // Métodos para batalhas
  public async createBattle(hostId: string): Promise<Battle | null> {
    const { data, error } = await this.supabase
      .from('battles')
      .insert([{ host_id: hostId }])
      .select('*')
      .single();

    if (error || !data) return null;

    // Inicializar logs
    await this.supabase
      .from('battle_logs')
      .insert([{
        battle_id: data.id,
        turn: 0,
        message: `Battle ${data.id} created!`
      }]);

    // Inicializar estado da batalha
    await this.supabase
      .from('battle_states')
      .insert([{ battle_id: data.id }]);

    return this.getBattle(data.id);
  }

  public async joinBattle(battleId: string, guestId: string): Promise<Battle | null> {
    // Verificar se a batalha existe e está esperando
    const { data: battle, error: battleError } = await this.supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .eq('state', 'WAITING')
      .single();

    if (battleError || !battle) return null;

    // Atualizar batalha
    const { data, error } = await this.supabase
      .from('battles')
      .update({ guest_id: guestId, state: 'READY' })
      .eq('id', battleId)
      .select('*')
      .single();

    if (error || !data) return null;

    // Adicionar log
    await this.supabase
      .from('battle_logs')
      .insert([{
        battle_id: battleId,
        turn: 0,
        message: `Guest joined the battle!`
      }]);

    return this.getBattle(battleId);
  }

  public async startBattle(battleId: string): Promise<Battle | null> {
    const { data, error } = await this.supabase
      .from('battles')
      .update({ state: 'BATTLING' })
      .eq('id', battleId)
      .eq('state', 'READY')
      .select('*')
      .single();

    if (error || !data) return null;

    // Adicionar log
    await this.supabase
      .from('battle_logs')
      .insert([{
        battle_id: battleId,
        turn: 0,
        message: `The battle has started!`
      }]);

    return this.getBattle(battleId);
  }

  public async getBattle(battleId: string): Promise<Battle | null> {
    // Obter informações básicas da batalha
    const { data: battle, error: battleError } = await this.supabase
      .from('battles')
      .select(`
        *,
        host:host_id(*),
        guest:guest_id(*)
      `)
      .eq('id', battleId)
      .single();



    if (battleError || !battle) return null;

    // Obter logs da batalha
    const { data: logs } = await this.supabase
      .from('battle_logs')
      .select('*')
      .eq('battle_id', battleId)
      .order('created_at', { ascending: true });

    // Obter estado atual da batalha
    const { data: battleState } = await this.supabase
      .from('battle_states')
      .select('*')
      .eq('battle_id', battleId)
      .single();

    // Obter treinadores com seus Brotmons atuais
    const host = await this.getTrainer(battle.host_id);
    const guest = battle.guest_id ? await this.getTrainer(battle.guest_id) : null;

    if (!host) return null;

    // Formatar os dados para o tipo Battle
    return {
      id: battle.id,
      trainers: [host, guest],
      moves: [null, null], // Será preenchido durante a batalha
      turn: battle.turn,
      logs: this.groupLogsByTurn(logs || []),
      state: battle.state as BattleState,
      winner: battle.winner as -1 | 0 | 1,
      createdAt: new Date(battle.created_at).getTime(),
      lastUpdated: new Date(battle.updated_at).getTime()
    };
  }

  private groupLogsByTurn(logs: any[]): Log[][] {
    const grouped: Log[][] = [];
    logs.forEach(log => {
      if (!grouped[log.turn]) grouped[log.turn] = [];
      grouped[log.turn].push({
        date: new Date(log.created_at).getTime(),
        message: log.message
      });
    });
    return grouped;
  }

  public async performAction(
    battleId: string,
    trainerId: string,
    payload: BattleActionPayload
  ): Promise<Battle | null> {
    // Verificar se a batalha existe e está em andamento
    const battle = await this.getBattle(battleId);
    if (!battle || battle.state !== BattleState.BATTLING) return null;

    // Determinar se o treinador é host ou guest
    const role = battle.trainers[0]?.id === trainerId ? 0 : 
                 battle.trainers[1]?.id === trainerId ? 1 : null;
    if (role === null) return null;

    // Registrar ação
    const { data: action, error } = await this.supabase
      .from('battle_actions')
      .insert([{
        battle_id: battleId,
        trainer_id: trainerId,
        action_type: payload.action,
        move_index: 'moveIndex' in payload ? payload.moveIndex : null,
        brotmon_index: 'brotmonIndex' in payload ? payload.brotmonIndex : null
      }])
      .select('*')
      .single();

    if (error) return null;

    // Atualizar estado da batalha
    await this.supabase
      .from('battle_states')
      .update({
        [`${role === 0 ? 'host' : 'guest'}_move`]: action.id
      })
      .eq('battle_id', battleId);

    // Verificar se ambas as ações foram registradas
    const { data: battleState } = await this.supabase
      .from('battle_states')
      .select('host_move, guest_move')
      .eq('battle_id', battleId)
      .single();

    if (battleState?.host_move && battleState?.guest_move) {
      await this.executeTurn(battleId);
    }

    return this.getBattle(battleId);
  }

  private async executeTurn(battleId: string): Promise<void> {
    const battle = await this.getBattle(battleId);
    if (!battle || !battle.trainers[0] || !battle.trainers[1]) return;

    // Obter ações dos treinadores
    const { data: actions } = await this.supabase
      .from('battle_actions')
      .select('*')
      .eq('battle_id', battleId)
      .order('created_at', { ascending: true });

    if (!actions || actions.length < 2) return;

    // Determinar ordem de ataque baseado na velocidade
    const [hostSpeed, guestSpeed] = [
      battle.trainers[0].brotmons[0].speed,
      battle.trainers[1].brotmons[0].speed
    ];

    const [hostMultiplier, guestMultiplier] = getSpeedMultipliers(
      battle.trainers[0].brotmons[0],
      battle.trainers[1].brotmons[0]
    );

    const first = Number(hostSpeed * hostMultiplier < guestSpeed * guestMultiplier);

    // Executar ações na ordem correta
    for (let i = 0; i < 2; i++) {
      const attackerIndex = ((first + i) % 2) as 0 | 1;
      const attacker = battle.trainers[attackerIndex]!;
      const target = battle.trainers[1 - attackerIndex]!;
      const action = actions.find(a => a.trainer_id === attacker.id);

      if (!action) continue;

      let canMove = this.handleInterruptiveEffects(battle, attacker.brotmons[0]);
      if (canMove) {
        switch (action.action_type) {
          case BattleAction.MOVE:
            await this.handleMove(
              battleId,
              attacker,
              target,
              action.move_index!
            );
            break;
          case BattleAction.SWITCH:
            await this.handleSwitch(
              battleId,
              attacker,
              action.brotmon_index!
            );
            break;
        }
      }
    }

    // Processar efeitos de status no final do turno
    for (let i = 0; i < 2; i++) {
      const trainer = battle.trainers[i];
      if (!trainer) continue;

      const brotmon = trainer.brotmons[0];
      const statusLogs = processStatusEffect(brotmon);
      
      for (const log of statusLogs) {
        await this.supabase
          .from('battle_logs')
          .insert([{
            battle_id: battleId,
            turn: battle.turn,
            message: log
          }]);
      }

      // Verificar se o Brotmon desmaiou
      if (brotmon.current_hp <= 0) {
        await this.supabase
          .from('battle_logs')
          .insert([{
            battle_id: battleId,
            turn: battle.turn,
            message: `${brotmon.name} fainted!`
          }]);

        // Verificar se o treinador perdeu
        const aliveBrotmons = trainer.brotmons.filter(b => b.current_hp > 0);
        if (aliveBrotmons.length === 0) {
          await this.supabase
            .from('battles')
            .update({
              state: 'FINISHED',
              winner: i as 0 | 1
            })
            .eq('id', battleId);

          await this.supabase
            .from('battle_logs')
            .insert([{
              battle_id: battleId,
              turn: battle.turn,
              message: `${trainer.name} won the battle!`
            }]);
        } else {
          // Trocar automaticamente para o próximo Brotmon
          await this.autoSwitchBrotmon(battleId, trainer);
        }
      }
    }

    // Incrementar turno e limpar ações
    await this.supabase
      .from('battles')
      .update({
        turn: battle.turn + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', battleId);

    await this.supabase
      .from('battle_states')
      .update({
        host_move: null,
        guest_move: null
      })
      .eq('battle_id', battleId);
  }

  private async handleMove(
    battleId: string,
    attacker: Trainer,
    target: Trainer,
    moveIndex: number
  ): Promise<void> {
    const move = attacker.brotmons[0].moves[moveIndex];
    if (!move || move.uses <= 0) {
      await this.supabase
        .from('battle_logs')
        .insert([{
          battle_id: battleId,
          turn: (await this.getBattle(battleId))?.turn || 0,
          message: `${attacker.brotmons[0].name} can't use ${move?.name || "that move"}!`
        }]);
      return;
    }

    // Atualizar usos do movimento
    await this.supabase
      .from('brotmon_moves')
      .update({ uses: move.uses - 1 })
      .eq('brotmon_id', attacker.brotmons[0].id)
      .eq('move_id', move.id);

    // Executar movimento
    const hitDice = Math.random();
    if (hitDice <= move.accuracy) {
      move.onHit(attacker.brotmons[0], target.brotmons[0]);

      await this.supabase
        .from('battle_logs')
        .insert