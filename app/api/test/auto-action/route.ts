import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, isNightPhase, isFirstNight } from '@/lib/game/constants';
import type { Player, ActionType } from '@/types/game';

// AI决策逻辑：根据角色和游戏状态自动选择行动
function getAIAction(player: Player, players: Player[], roundState: string): { actionType: ActionType | null; targetId: number | null } {
  const role = player.role;
  if (!role) return { actionType: null, targetId: null };

  const roundNumber = parseRoundNumber(roundState);
  const isFirst = isFirstNight(roundState);
  const alivePlayers = players.filter(p => p.is_alive && p.id !== player.id);

  if (alivePlayers.length === 0) {
    return { actionType: null, targetId: null };
  }

  // 随机选择一个目标
  const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

  switch (role) {
    case '技能观测者':
      return { actionType: 'check', targetId: randomTarget.id };
    
    case '利他守护者':
      // 保护一个随机玩家
      return { actionType: 'protect', targetId: randomTarget.id };
    
    case '沉默制裁者':
      // 禁言一个随机玩家
      return { actionType: 'silence', targetId: randomTarget.id };
    
    case '投票阻断者':
      // 阻止一个随机玩家投票
      return { actionType: 'block_vote', targetId: randomTarget.id };
    
    case '同盟者':
      // 仅第一夜可以绑定
      if (isFirst) {
        return { actionType: 'ally_bind', targetId: randomTarget.id };
      }
      return { actionType: null, targetId: null };
    
    case '影子胜者':
      // 仅第一夜可以绑定目标
      if (isFirst) {
        return { actionType: 'shadow_bind', targetId: randomTarget.id };
      }
      return { actionType: null, targetId: null };
    
    case '命运复制者':
      // 仅第一夜可以复制
      if (isFirst && !player.copied_role) {
        return { actionType: 'copy_fate', targetId: randomTarget.id };
      }
      return { actionType: null, targetId: null };
    
    case '命运转移者':
      // 转移命运给随机玩家
      return { actionType: 'fate_transfer', targetId: randomTarget.id };
    
    case '胜利夺取者':
      // 锁定一个随机玩家
      return { actionType: 'victory_steal', targetId: randomTarget.id };
    
    case '心灵胜者':
      // 预测一个随机投票者和目标
      const predictedVoter = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      const predictedTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      // 注意：这个需要特殊处理，因为需要两个目标
      // 暂时只返回一个目标，实际处理时会在process-night中处理
      return { actionType: 'predict_vote', targetId: predictedVoter.id };
    
    case '投票回收者':
      // 存储投票（不需要目标）
      return { actionType: 'store_vote', targetId: null };
    
    default:
      return { actionType: null, targetId: null };
  }
}

// AI投票逻辑
function getAIVote(player: Player, players: Player[]): number | null {
  const alivePlayers = players.filter(p => p.is_alive && p.id !== player.id);
  
  if (alivePlayers.length === 0) {
    return null; // 弃票
  }

  // 简单策略：随机投票或弃票（30%概率弃票）
  if (Math.random() < 0.3) {
    return null; // 弃票
  }

  // 随机选择一个目标
  const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  return randomTarget.id;
}

export async function POST(request: NextRequest) {
  try {
    const { roomCode, phase } = await request.json();

    if (!roomCode) {
      return NextResponse.json(
        { success: false, error: '房间号不能为空' },
        { status: 400 }
      );
    }

    // 获取房间状态
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('round_state')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { success: false, error: 'error.roomNotFound' },
        { status: 404 }
      );
    }

    // 获取所有AI玩家
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', roomCode)
      .eq('is_alive', true);

    if (playersError || !players) {
      return NextResponse.json(
        { success: false, error: 'error.dataReadFailed' },
        { status: 500 }
      );
    }

    // 注意：如果数据库没有is_bot字段，可以通过名称判断（AI-开头）
    const aiPlayers = players.filter(p => {
      // 优先使用is_bot字段，如果没有则通过名称判断
      if ((p as any).is_bot !== undefined) {
        return (p as any).is_bot === true;
      }
      return p.name.startsWith('AI-');
    });
    const allPlayers = players;

    if (phase === 'night') {
      // 夜晚阶段：AI自动提交行动
      const roundNumber = parseRoundNumber(room.round_state);
      const actions = [];

      for (const aiPlayer of aiPlayers) {
        const { actionType, targetId } = getAIAction(aiPlayer, allPlayers, room.round_state);
        
        if (actionType) {
          // 特殊处理心灵胜者（需要两个目标）
          if (actionType === 'predict_vote') {
            const alivePlayers = allPlayers.filter(p => p.is_alive && p.id !== aiPlayer.id);
            const predictedVoter = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            const predictedTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            
            // 先创建预测记录
            await supabase.from('vote_predictions').insert({
              room_code: roomCode,
              predictor_id: aiPlayer.id,
              predicted_player_id: predictedVoter.id,
              predicted_target_id: predictedTarget.id,
              round_number: roundNumber
            });

            actions.push({
              room_code: roomCode,
              actor_id: aiPlayer.id,
              target_id: predictedVoter.id, // 使用预测的投票者作为目标
              action_type: actionType,
              round_number: roundNumber
            });
          } else {
            actions.push({
              room_code: roomCode,
              actor_id: aiPlayer.id,
              target_id: targetId,
              action_type: actionType,
              round_number: roundNumber
            });
          }
        }
      }

      if (actions.length > 0) {
        const { error: actionError } = await supabase
          .from('night_actions')
          .insert(actions);

        if (actionError) {
          return NextResponse.json(
            { success: false, error: '提交AI行动失败', details: actionError.message },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: { actionCount: actions.length }
      });
    } else if (phase === 'day') {
      // 白天阶段：AI自动投票
      const roundNumber = parseRoundNumber(room.round_state);
      const votes = [];

      for (const aiPlayer of aiPlayers) {
        // 检查是否被阻止投票
        if (aiPlayer.flags?.cannot_vote) {
          continue;
        }

        const targetId = getAIVote(aiPlayer, allPlayers);
        
        votes.push({
          room_code: roomCode,
          voter_id: aiPlayer.id,
          target_id: targetId,
          round_number: roundNumber
        });
      }

      if (votes.length > 0) {
        const { error: voteError } = await supabase
          .from('votes')
          .insert(votes);

        if (voteError) {
          return NextResponse.json(
            { success: false, error: '提交AI投票失败', details: voteError.message },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        data: { voteCount: votes.length }
      });
    } else {
      return NextResponse.json(
        { success: false, error: '无效的阶段' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'error.serverError', details: error.message },
      { status: 500 }
    );
  }
}

