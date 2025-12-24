import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'error.enterName' },
        { status: 400 }
      );
    }

    // 生成房间号（4位数字）
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // 创建房间
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert([{ code, round_state: 'LOBBY', board_type: 'custom' }])
      .select()
      .single();

    if (roomError) {
      return NextResponse.json(
        { success: false, error: 'error.createRoomFailed', details: roomError.message },
        { status: 500 }
      );
    }

    // 创建房主玩家
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert([{
        room_code: code,
        name,
        is_host: true,
        is_alive: true
      }])
      .select()
      .single();

    if (playerError) {
      // 如果创建玩家失败，删除房间
      await supabase.from('rooms').delete().eq('code', code);
      return NextResponse.json(
        { success: false, error: 'error.createPlayerFailed', details: playerError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        roomCode: code,
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

