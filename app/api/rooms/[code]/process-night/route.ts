import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, isFirstNight } from '@/lib/game/constants';
import { NIGHT_ACTION_ORDER } from '@/lib/game/roles';
import type { ActionType } from '@/types/game';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // 1. 获取数据
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', code);

    const { data: actions, error: actionsError } = await supabase
      .from('night_actions')
      .select('*')
      .eq('room_code', code);

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('round_state')
      .eq('code', code)
      .single();

    if (playersError || !players || actionsError || !actions || roomError || !room) {
      return NextResponse.json(
        { success: false, error: '数据读取失败' },
        { status: 500 }
      );
    }

    const roundNumber = parseRoundNumber(room.round_state);
    const isFirst = isFirstNight(room.round_state);

    // 2. 初始化更新对象
    const updates: Record<number, any> = {};
    players.forEach(p => {
      const currentFlags = p.flags || {};
      const newFlags = { ...currentFlags };
      // 清除临时状态
      delete newFlags.is_protected;
      delete newFlags.is_silenced;
      delete newFlags.cannot_vote;

      updates[p.id] = {
        ...p,
        flags: newFlags
      };
    });

    const logs: Array<{ message: string; viewer_ids: number[] | null; tag: 'PUBLIC' | 'PRIVATE' }> = [];

    // 辅助函数：获取玩家名字
    const getName = (id: number) => {
      const player = updates[id] || players.find(p => p.id === id);
      return player?.name || `未知玩家(${id})`;
    };

    // 3. 按顺序处理夜晚技能
    // 注意：只处理第一夜才能使用的技能
    const firstNightOnlyActions: ActionType[] = ['ally_bind', 'shadow_bind', 'copy_fate'];
    
    for (const roleName of NIGHT_ACTION_ORDER) {
      const rolePlayers = players.filter(p => p.is_alive && p.role === roleName);
      
      for (const player of rolePlayers) {
        // 检查是否是第一夜才能使用的技能
        const action = actions.find(a => a.actor_id === player.id);
        if (!action) continue;

        const actionType = action.action_type as ActionType;
        
        // 第一夜限制检查
        if (firstNightOnlyActions.includes(actionType) && !isFirst) {
          continue; // 跳过非第一夜的绑定类技能
        }

        // 处理各种技能
        switch (actionType) {
          case 'check': // 技能观测者
            if (action.target_id) {
              const target = players.find(p => p.id === action.target_id);
              if (target) {
                logs.push({
                  message: `观测结果：玩家【${target.name}】的身份是【${target.role}】。`,
                  viewer_ids: [player.id],
                  tag: 'PRIVATE'
                });
              }
            }
            break;

          case 'protect': // 利他守护者
            if (action.target_id && updates[action.target_id]) {
              updates[action.target_id].flags.is_protected = true;
              logs.push({
                message: `你成功守护了玩家【${getName(action.target_id)}】，他明天将免疫投票。`,
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'silence': // 沉默制裁者
            if (action.target_id && updates[action.target_id]) {
              updates[action.target_id].flags.is_silenced = true;
              logs.push({
                message: '你被【沉默制裁者】禁言了！明天白天无法发言，但你的技能依然生效。',
                viewer_ids: [action.target_id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'block_vote': // 投票阻断者
            if (action.target_id && updates[action.target_id]) {
              updates[action.target_id].flags.cannot_vote = true;
              logs.push({
                message: '你感到一股无形的力量阻止了你，明天你将无法投票。',
                viewer_ids: [action.target_id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'ally_bind': // 同盟者（仅第一夜）
            if (action.target_id && isFirst) {
              updates[player.id].flags.ally_id = action.target_id;
              logs.push({
                message: `契约已成！你已与玩家【${getName(action.target_id)}】结为同盟。`,
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'shadow_bind': // 影子胜者（仅第一夜）
            if (action.target_id && isFirst) {
              updates[player.id].flags.shadow_target_id = action.target_id;
              logs.push({
                message: `目标锁定！你已选定玩家【${getName(action.target_id)}】为你的影子目标。`,
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'copy_fate': // 命运复制者（仅第一夜）
            if (action.target_id && isFirst) {
              const target = players.find(p => p.id === action.target_id);
              if (target && target.role) {
                updates[player.id].copied_role = target.role;
                updates[player.id].copied_from_id = action.target_id;
                logs.push({
                  message: `复制成功！你已获得玩家【${getName(action.target_id)}】的角色【${target.role}】的技能。`,
                  viewer_ids: [player.id],
                  tag: 'PRIVATE'
                });
              }
            }
            break;

          case 'fate_transfer': // 命运转移者
            if (action.target_id) {
              updates[player.id].fate_target_id = action.target_id;
              logs.push({
                message: `命运已转移！你与玩家【${getName(action.target_id)}】的命运已调换。`,
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'predict_vote': // 心灵胜者
            // 需要从 action 中获取预测的投票者和目标
            // 这里需要扩展 night_actions 表或使用其他方式存储预测信息
            // 暂时使用 target_id 作为预测的目标，predicted_voter_id 需要从其他地方获取
            if (action.target_id) {
              logs.push({
                message: `预测已记录：你已预测一名玩家的投票。`,
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'victory_steal': // 胜利夺取者
            if (action.target_id) {
              updates[player.id].flags.victory_steal_target_id = action.target_id;
              logs.push({
                message: `夺取已锁定！你已锁定玩家【${getName(action.target_id)}】的特殊胜利条件。`,
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;
        }
      }
    }

    // 4. 生成公告
    const silencedCount = Object.values(updates).filter((u: any) => u.flags?.is_silenced).length;
    logs.push({
      message: silencedCount > 0
        ? `天亮了。昨晚有 ${silencedCount} 名玩家被禁言。`
        : '天亮了，昨晚风平浪静。',
      viewer_ids: null,
      tag: 'PUBLIC'
    });

    // 5. 提交数据库
    const playerUpdates = Object.values(updates);
    const { error: updateError } = await supabase
      .from('players')
      .upsert(playerUpdates);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: '更新玩家失败', details: updateError.message },
        { status: 500 }
      );
    }

    // 6. 插入日志
    if (logs.length > 0) {
      const logsPayload = logs.map(l => ({
        room_code: code,
        message: l.message,
        viewer_ids: l.viewer_ids,
        tag: l.tag
      }));
      await supabase.from('game_logs').insert(logsPayload);
    }

    // 7. 切换到白天
    const nextRoundStr = `DAY ${roundNumber}`;
    await supabase
      .from('rooms')
      .update({ round_state: nextRoundStr })
      .eq('code', code);

    // 8. 清空夜晚行动
    await supabase
      .from('night_actions')
      .delete()
      .eq('room_code', code);

    return NextResponse.json({
      success: true,
      message: '夜晚结算完成'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
}

