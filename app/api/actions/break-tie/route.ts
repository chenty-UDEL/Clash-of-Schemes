import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, isDayPhase } from '@/lib/game/constants';

export async function POST(request: NextRequest) {
  try {
    const { roomCode, playerId, targetId } = await request.json();

    if (!roomCode || !playerId || !targetId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 1. 检查玩家是否是均衡守护者
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, role, balance_guard_used, is_alive')
      .eq('id', playerId)
      .eq('room_code', roomCode)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { success: false, error: '玩家不存在' },
        { status: 404 }
      );
    }

    if (player.role !== '均衡守护者') {
      return NextResponse.json(
        { success: false, error: '只有均衡守护者可以打破平局' },
        { status: 403 }
      );
    }

    if (player.balance_guard_used) {
      return NextResponse.json(
        { success: false, error: '技能已使用' },
        { status: 400 }
      );
    }

    if (!player.is_alive) {
      return NextResponse.json(
        { success: false, error: '你已出局，无法使用技能' },
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

    if (!isDayPhase(room.round_state)) {
      return NextResponse.json(
        { success: false, error: '只能在白天阶段打破平局' },
        { status: 400 }
      );
    }

    // 3. 标记技能已使用
    const { error: updateError } = await supabase
      .from('players')
      .update({ balance_guard_used: true })
      .eq('id', playerId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: '更新失败', details: updateError.message },
        { status: 500 }
      );
    }

    // 4. 创建日志
    const { data: targetPlayer } = await supabase
      .from('players')
      .select('name')
      .eq('id', targetId)
      .single();

    await supabase.from('game_logs').insert({
      room_code: roomCode,
      message: `【均衡守护者】打破平局！玩家【${targetPlayer?.name || targetId}】被处决。`,
      viewer_ids: null,
      tag: 'PUBLIC'
    });

    // 5. 处决目标玩家
    await supabase
      .from('players')
      .update({
        is_alive: false,
        death_round: parseRoundNumber(room.round_state),
        death_type: 'SKILL'
      })
      .eq('id', targetId)
      .eq('room_code', roomCode);

    return NextResponse.json({
      success: true,
      message: '平局已打破'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
}

