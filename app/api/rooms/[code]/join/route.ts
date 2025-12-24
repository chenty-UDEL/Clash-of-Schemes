import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'error.enterName' },
        { status: 400 }
      );
    }

    // 检查房间是否存在
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('code, round_state')
      .eq('code', code)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { success: false, error: 'error.roomNotFound' },
        { status: 404 }
      );
    }

    // 检查房间是否已开始游戏
    if (room.round_state !== 'LOBBY') {
      return NextResponse.json(
        { success: false, error: 'error.gameStarted' },
        { status: 400 }
      );
    }

    // 检查玩家数量
    const { count } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_code', code);

    if (count && count >= 12) {
      return NextResponse.json(
        { success: false, error: 'error.roomFull' },
        { status: 400 }
      );
    }

    // 创建玩家
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert([{
        room_code: code,
        name,
        is_host: false,
        is_alive: true
      }])
      .select()
      .single();

    if (playerError) {
      return NextResponse.json(
        { success: false, error: 'error.joinFailed', details: playerError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        playerId: player.id
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'error.serverError', details: error.message },
      { status: 500 }
    );
  }
}

