import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, isDayPhase } from '@/lib/game/constants';
import { tWithParams, getLanguage } from '@/lib/i18n';

export async function POST(request: NextRequest) {
  try {
    const { roomCode, playerId, targetId } = await request.json();

    if (!roomCode || !playerId || !targetId) {
      return NextResponse.json(
        { success: false, error: 'error.missingParams' },
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
        { success: false, error: 'error.playerNotFound' },
        { status: 404 }
      );
    }

    if (player.role !== '均衡守护者') {
      return NextResponse.json(
        { success: false, error: 'error.onlyBalanceGuard' },
        { status: 403 }
      );
    }

    if (player.balance_guard_used) {
      return NextResponse.json(
        { success: false, error: 'error.skillUsed' },
        { status: 400 }
      );
    }

    if (!player.is_alive) {
      return NextResponse.json(
        { success: false, error: 'error.playerDead' },
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
        { success: false, error: 'error.roomNotFound' },
        { status: 404 }
      );
    }

    if (!isDayPhase(room.round_state)) {
      return NextResponse.json(
        { success: false, error: 'error.onlyDayPhase' },
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
        { success: false, error: 'error.updatePlayerFailed', details: updateError.message },
        { status: 500 }
      );
    }

    // 4. 创建日志
    const { data: targetPlayer } = await supabase
      .from('players')
      .select('name')
      .eq('id', targetId)
      .single();

    // 使用默认中文生成日志消息（服务端无法访问sessionStorage）
    // 前端显示时会根据玩家语言设置进行翻译
    const lang: 'zh' | 'en' = 'zh';

    await supabase.from('game_logs').insert({
      room_code: roomCode,
      message: tWithParams('gameLog.balanceGuardBreakTie', { name: targetPlayer?.name || `玩家${targetId}` }, lang),
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
      message: 'success.tieBroken'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'error.serverError', details: error.message },
      { status: 500 }
    );
  }
}

