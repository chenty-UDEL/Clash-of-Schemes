import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { BOARDS, ALL_ROLES, type BoardType } from '@/lib/game/roles';
import { MIN_PLAYERS, MAX_PLAYERS } from '@/lib/game/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { boardType = 'custom' } = await request.json();

    // 1. 获取房间和玩家
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('code, round_state, board_type')
      .eq('code', code)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { success: false, error: '房间不存在' },
        { status: 404 }
      );
    }

    if (room.round_state !== 'LOBBY') {
      return NextResponse.json(
        { success: false, error: '游戏已开始' },
        { status: 400 }
      );
    }

    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', code)
      .eq('is_alive', true);

    if (playersError || !players) {
      return NextResponse.json(
        { success: false, error: '获取玩家失败' },
        { status: 500 }
      );
    }

    // 2. 验证玩家数量
    if (players.length < MIN_PLAYERS) {
      return NextResponse.json(
        { success: false, error: `至少需要 ${MIN_PLAYERS} 人才能开始游戏` },
        { status: 400 }
      );
    }

    if (players.length > MAX_PLAYERS) {
      return NextResponse.json(
        { success: false, error: `最多支持 ${MAX_PLAYERS} 人` },
        { status: 400 }
      );
    }

    // 3. 根据板子类型获取角色列表
    let rolesToAssign: string[] = [];
    
    if (boardType === 'custom') {
      // 自定义：从所有角色中随机选择
      rolesToAssign = [...ALL_ROLES];
    } else {
      // 预设板子：从板子配置中获取
      const boardRoles = BOARDS[boardType as BoardType];
      rolesToAssign = [...boardRoles];
    }

    // 4. 如果玩家人数少于角色数，随机选择对应数量的角色
    if (players.length < rolesToAssign.length) {
      const shuffled = [...rolesToAssign].sort(() => Math.random() - 0.5);
      rolesToAssign = shuffled.slice(0, players.length);
    }

    // 5. 如果玩家人数多于角色数，补充普通玩家
    while (rolesToAssign.length < players.length) {
      rolesToAssign.push('普通玩家');
    }

    // 6. 随机洗牌（Fisher-Yates）
    for (let i = rolesToAssign.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesToAssign[i], rolesToAssign[j]] = [rolesToAssign[j], rolesToAssign[i]];
    }

    // 7. 分配角色并初始化状态
    const playerUpdates = players.map((player, index) => ({
      id: player.id,
      room_code: code,
      name: player.name,
      role: rolesToAssign[index],
      is_alive: true,
      is_host: player.is_host,
      death_round: null,
      death_type: null,
      stored_votes: 0,
      reverse_vote_used: false,
      balance_guard_used: false,
      flags: {}
    }));

    // 8. 更新数据库
    const { error: updateError } = await supabase
      .from('players')
      .upsert(playerUpdates);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: '分配角色失败', details: updateError.message },
        { status: 500 }
      );
    }

    // 9. 清空旧数据
    await supabase.from('votes').delete().eq('room_code', code);
    await supabase.from('night_actions').delete().eq('room_code', code);
    await supabase.from('game_logs').delete().eq('room_code', code);
    await supabase.from('game_states').delete().eq('room_code', code);
    await supabase.from('vote_predictions').delete().eq('room_code', code);

    // 10. 更新房间状态
    const { error: roomUpdateError } = await supabase
      .from('rooms')
      .update({
        round_state: 'NIGHT 1',
        board_type: boardType,
        deadlock_count: 0,
        last_state_hash: null
      })
      .eq('code', code);

    if (roomUpdateError) {
      return NextResponse.json(
        { success: false, error: '更新房间状态失败', details: roomUpdateError.message },
        { status: 500 }
      );
    }

    // 11. 创建游戏日志
    await supabase.from('game_logs').insert([{
      room_code: code,
      message: `🎮 游戏开始！板子：${boardType === 'custom' ? '自定义' : boardType}，共 ${players.length} 名玩家。`,
      viewer_ids: null,
      tag: 'PUBLIC'
    }]);

    return NextResponse.json({
      success: true,
      message: '游戏开始！'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
}

