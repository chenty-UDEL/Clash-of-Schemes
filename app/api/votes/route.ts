import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, isDayPhase } from '@/lib/game/constants';

export async function POST(request: NextRequest) {
  try {
    const { roomCode, voterId, targetId, useStoredVotes = 0 } = await request.json();

    // 1. 验证参数
    if (!roomCode || !voterId) {
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

    if (!isDayPhase(room.round_state)) {
      return NextResponse.json(
        { success: false, error: '当前不是投票阶段' },
        { status: 400 }
      );
    }

    // 3. 检查玩家状态（包括投票回收者的存储票数）
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, is_alive, flags, role, stored_votes')
      .eq('id', voterId)
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
        { success: false, error: '你已出局，无法投票' },
        { status: 400 }
      );
    }

    // 4. 检查是否被禁止投票
    if (player.flags?.cannot_vote) {
      return NextResponse.json(
        { success: false, error: '你被【投票阻断者】限制，今日无法投票！' },
        { status: 403 }
      );
    }

    // 5. 处理投票回收者的存储投票
    if (player.role === '投票回收者' && useStoredVotes > 0) {
      const currentStored = player.stored_votes || 0;
      if (useStoredVotes > currentStored) {
        return NextResponse.json(
          { success: false, error: `存储的票数不足（当前：${currentStored}）` },
          { status: 400 }
        );
      }
      
      // 清空使用的存储票数
      const { error: updateError } = await supabase
        .from('players')
        .update({ stored_votes: currentStored - useStoredVotes })
        .eq('id', voterId);
      
      if (updateError) {
        return NextResponse.json(
          { success: false, error: '更新存储票数失败', details: updateError.message },
          { status: 500 }
        );
      }
    }

    // 6. 获取当前回合号
    const roundNumber = parseRoundNumber(room.round_state);

    // 7. 提交投票（使用 upsert 覆盖旧票）
    // 注意：投票回收者的多票效果在process-day结算时计算，这里只记录基础投票
    const { error: voteError } = await supabase
      .from('votes')
      .upsert({
        room_code: roomCode,
        voter_id: voterId,
        target_id: targetId || null, // null 代表弃票
        round_number: roundNumber
      }, {
        onConflict: 'room_code, voter_id, round_number'
      });

    if (voteError) {
      return NextResponse.json(
        { success: false, error: '投票失败', details: voteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '投票已记录'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
}

