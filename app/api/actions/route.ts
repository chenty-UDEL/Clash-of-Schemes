import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, isNightPhase } from '@/lib/game/constants';
import type { ActionType } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const { roomCode, actorId, targetId, actionType, predictedVoterId } = await request.json();

    // 1. 验证参数
    if (!roomCode || !actorId || !actionType) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 2. 检查房间状态
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('round_state')
      .eq('code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }

    if (!isNightPhase(room.round_state)) {
      return NextResponse.json(
        { success: false, error: '当前不是夜晚阶段' },
        { status: 400 }
      );
    }

    // 3. 检查玩家状态
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, is_alive, role')
      .eq('id', actorId)
      .eq('room_code', roomCode)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { success: false, error: '玩家不存在' },
        { status: 404 }
      );
    }

    if (!player.is_alive) {
      return NextResponse.json(
        { success: false, error: '你已出局，无法发动技能' },
        { status: 400 }
      );
    }

    // 4. 获取当前回合号
    const roundNumber = parseRoundNumber(room.round_state);

    // 5. 检查是否已经提交过行动（先删除旧记录，再插入新记录）
    // 先删除该玩家本回合的旧行动
    await supabase
      .from('night_actions')
      .delete()
      .eq('room_code', roomCode)
      .eq('actor_id', actorId)
      .eq('round_number', roundNumber);

    // 插入新行动
    const { error: actionError } = await supabase
      .from('night_actions')
      .insert({
        room_code: roomCode,
        actor_id: actorId,
        target_id: targetId || null,
        action_type: actionType as ActionType,
        round_number: roundNumber
      });

    // 6. 如果是心灵胜者，保存预测记录
    if (actionType === 'predict_vote' && predictedVoterId) {
      await supabase
        .from('vote_predictions')
        .insert({
          room_code: roomCode,
          predictor_id: actorId,
          predicted_player_id: predictedVoterId,
          predicted_target_id: targetId || null,
          round_number: roundNumber,
          is_correct: null // 白天结算时验证
        });
    }

    if (actionError) {
      return NextResponse.json(
        { success: false, error: '提交行动失败', details: actionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '行动已记录'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
}

