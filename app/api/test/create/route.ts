import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { ALL_ROLES, BOARDS, type BoardType } from '@/lib/game/roles';

// 虚拟玩家名称池
const BOT_NAMES = [
  'AI-阿尔法', 'AI-贝塔', 'AI-伽马', 'AI-德尔塔', 'AI-艾普西龙',
  'AI-泽塔', 'AI-伊塔', 'AI-西塔', 'AI-约塔', 'AI-卡帕',
  'AI-拉姆达', 'AI-缪', 'AI-纽', 'AI-克西', 'AI-欧米伽'
];

export async function POST(request: NextRequest) {
  try {
    const { playerName, selectedRole, boardType = 'custom' } = await request.json();

    if (!playerName) {
      return NextResponse.json(
        { success: false, error: 'error.enterName' },
        { status: 400 }
      );
    }

    if (!selectedRole) {
      return NextResponse.json(
        { success: false, error: '请选择要测试的角色' },
        { status: 400 }
      );
    }

    // 生成测试房间号（以TEST开头）
    const code = `TEST${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. 创建测试房间
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert([{ 
        code, 
        round_state: 'LOBBY', 
        board_type: boardType as BoardType 
      }])
      .select()
      .single();

    if (roomError) {
      return NextResponse.json(
        { success: false, error: 'error.createRoomFailed', details: roomError.message },
        { status: 500 }
      );
    }

    // 2. 确定需要的玩家数量（6-8人，适合测试）
    const targetPlayerCount = 7;
    const botCount = targetPlayerCount - 1; // 减去真实玩家

    // 3. 获取板子角色列表
    const boardRoles = boardType === 'custom' 
      ? [...ALL_ROLES] 
      : BOARDS[boardType as BoardType];

    // 4. 创建角色分配列表（确保包含用户选择的角色）
    const rolePool = [...boardRoles];
    const shuffledRoles: string[] = [];
    
    // 先添加用户选择的角色
    shuffledRoles.push(selectedRole);
    
    // 随机选择其他角色
    const remainingRoles = rolePool.filter(r => r !== selectedRole);
    while (shuffledRoles.length < targetPlayerCount && remainingRoles.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingRoles.length);
      shuffledRoles.push(remainingRoles.splice(randomIndex, 1)[0]);
    }
    
    // 如果角色不够，随机重复
    while (shuffledRoles.length < targetPlayerCount) {
      const randomRole = rolePool[Math.floor(Math.random() * rolePool.length)];
      shuffledRoles.push(randomRole);
    }

    // 打乱角色顺序（但保持用户角色在第一个）
    const userRole = shuffledRoles[0];
    const otherRoles = shuffledRoles.slice(1);
    for (let i = otherRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [otherRoles[i], otherRoles[j]] = [otherRoles[j], otherRoles[i]];
    }
    const finalRoles = [userRole, ...otherRoles];

    // 5. 创建真实玩家（房主）
    // 注意：不使用is_bot字段，通过名称前缀区分（AI-开头的是AI玩家）
    const { data: realPlayer, error: realPlayerError } = await supabase
      .from('players')
      .insert([{
        room_code: code,
        name: playerName,
        role: selectedRole,
        is_host: true,
        is_alive: true
      }])
      .select()
      .single();

    if (realPlayerError) {
      await supabase.from('rooms').delete().eq('code', code);
      return NextResponse.json(
        { success: false, error: 'error.createPlayerFailed', details: realPlayerError.message },
        { status: 500 }
      );
    }

    // 6. 创建虚拟玩家（AI）
    const botPlayers = [];
    for (let i = 0; i < botCount; i++) {
      botPlayers.push({
        room_code: code,
        name: BOT_NAMES[i] || `AI-${i + 1}`,
        role: finalRoles[i + 1], // 跳过第一个（真实玩家）
        is_host: false,
        is_alive: true,
        // 注意：is_bot字段需要在数据库中添加，如果没有则移除此行
      });
    }

    const { data: createdBots, error: botError } = await supabase
      .from('players')
      .insert(botPlayers)
      .select();

    if (botError || !createdBots) {
      // 清理已创建的数据
      await supabase.from('players').delete().eq('room_code', code);
      await supabase.from('rooms').delete().eq('code', code);
      return NextResponse.json(
        { success: false, error: 'error.createPlayerFailed', details: botError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        roomCode: code,
        playerId: realPlayer.id,
        botCount: botCount,
        totalPlayers: targetPlayerCount
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'error.serverError', details: error.message },
      { status: 500 }
    );
  }
}

