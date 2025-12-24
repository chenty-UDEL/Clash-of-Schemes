import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { ALL_ROLES } from '@/lib/game/roles';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { role, roomCode } = await request.json();

    if (!role || !roomCode) {
      return NextResponse.json(
        { success: false, error: 'error.missingParams' },
        { status: 400 }
      );
    }

    // 验证角色是否有效
    if (!ALL_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'error.invalidRole' },
        { status: 400 }
      );
    }

    // 检查玩家是否存在且是房主
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, is_host, room_code')
      .eq('id', parseInt(id))
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { success: false, error: 'error.playerNotFound' },
        { status: 404 }
      );
    }

    if (!player.is_host) {
      return NextResponse.json(
        { success: false, error: 'error.onlyHost' },
        { status: 403 }
      );
    }

    if (player.room_code !== roomCode) {
      return NextResponse.json(
        { success: false, error: 'error.roomMismatch' },
        { status: 403 }
      );
    }

    // 更新角色
    const { error: updateError } = await supabase
      .from('players')
      .update({ role })
      .eq('id', parseInt(id));

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'error.updateRoleFailed', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'success.roleUpdated'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'error.serverError', details: error.message },
      { status: 500 }
    );
  }
}

