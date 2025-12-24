import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { MAX_STORED_VOTES } from '@/lib/game/constants';

export async function POST(request: NextRequest) {
  try {
    const { roomCode, playerId } = await request.json();

    if (!roomCode || !playerId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 检查玩家是否是投票回收者
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, role, stored_votes, is_alive')
      .eq('id', playerId)
      .eq('room_code', roomCode)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { success: false, error: '玩家不存在' },
        { status: 404 }
      );
    }

    if (player.role !== '投票回收者') {
      return NextResponse.json(
        { success: false, error: '只有投票回收者可以存储投票' },
        { status: 403 }
      );
    }

    if (!player.is_alive) {
      return NextResponse.json(
        { success: false, error: '你已出局，无法存储投票' },
        { status: 400 }
      );
    }

    const currentStored = player.stored_votes || 0;
    if (currentStored >= MAX_STORED_VOTES) {
      return NextResponse.json(
        { success: false, error: `最多只能存储 ${MAX_STORED_VOTES} 张票` },
        { status: 400 }
      );
    }

    // 更新存储的票数
    const { error: updateError } = await supabase
      .from('players')
      .update({ stored_votes: currentStored + 1 })
      .eq('id', playerId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'error.updateVotesFailed', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        storedVotes: currentStored + 1
      },
      message: 'success.voteStored'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'error.serverError', details: error.message },
      { status: 500 }
    );
  }
}

