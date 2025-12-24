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
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 验证角色是否有效
    if (!ALL_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: '无效的角色' },
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
        { success: false, error: '玩家不存在' },
        { status: 404 }
      );
    }

    if (!player.is_host) {
      return NextResponse.json(
        { success: false, error: '只有房主可以使用此功能' },
        { status: 403 }
      );
    }

    if (player.room_code !== roomCode) {
      return NextResponse.json(
        { success: false, error: '房间不匹配' },
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
        { success: false, error: '更新角色失败', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '角色已更新'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
}

