import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { parseRoundNumber, isFirstNight } from '@/lib/game/constants';
import { NIGHT_ACTION_ORDER, getRoleConfig } from '@/lib/game/roles';
import { t, tWithParams, getLanguage } from '@/lib/i18n';
import { getRoleName } from '@/lib/game/roleTranslations';
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
        { success: false, error: 'error.dataReadFailed' },
        { status: 500 }
      );
    }

    const roundNumber = parseRoundNumber(room.round_state);
    const isFirst = isFirstNight(room.round_state);
    
    // 获取语言（从请求头或使用默认）
    const acceptLanguage = request.headers.get('accept-language') || 'zh-CN';
    const lang: 'zh' | 'en' = acceptLanguage.startsWith('en') ? 'en' : 'zh';

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
      // 获取拥有该角色的玩家（包括命运复制者复制的角色）
      const rolePlayers = players.filter(p => {
        if (!p.is_alive) return false;
        // 直接拥有该角色
        if (p.role === roleName) return true;
        // 命运复制者复制的角色
        if (p.role === '命运复制者' && p.copied_role === roleName && !isFirst) return true;
        return false;
      });
      
      for (const player of rolePlayers) {
        // 检查是否是第一夜才能使用的技能
        const action = actions.find(a => a.actor_id === player.id);
        if (!action) continue;

        const actionType = action.action_type as ActionType;
        
        // 第一夜限制检查
        if (firstNightOnlyActions.includes(actionType) && !isFirst) {
          continue; // 跳过非第一夜的绑定类技能
        }
        
        // 命运复制者：第一夜后只能使用复制的角色技能
        if (player.role === '命运复制者' && !isFirst && !player.copied_role) {
          continue; // 第一夜后但还没复制角色，跳过
        }

        // 处理各种技能
        switch (actionType) {
          case 'check': // 技能观测者
            if (action.target_id) {
              const target = players.find(p => p.id === action.target_id);
              if (target) {
                const roleName = getRoleName(target.role as any);
                logs.push({
                  message: tWithParams('gameLog.observationResult', { name: target.name, role: roleName }, lang),
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
                message: tWithParams('gameLog.protectionSuccess', { name: getName(action.target_id) }, lang),
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'silence': // 沉默制裁者
            if (action.target_id && updates[action.target_id]) {
              updates[action.target_id].flags.is_silenced = true;
              logs.push({
                message: t('gameLog.silenced', lang),
                viewer_ids: [action.target_id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'block_vote': // 投票阻断者
            if (action.target_id && updates[action.target_id]) {
              updates[action.target_id].flags.cannot_vote = true;
              logs.push({
                message: t('gameLog.voteBlocked', lang),
                viewer_ids: [action.target_id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'ally_bind': // 同盟者（仅第一夜）
            if (action.target_id && isFirst) {
              updates[player.id].flags.ally_id = action.target_id;
              logs.push({
                message: tWithParams('gameLog.allyFormed', { name: getName(action.target_id) }, lang),
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'shadow_bind': // 影子胜者（仅第一夜）
            if (action.target_id && isFirst) {
              updates[player.id].flags.shadow_target_id = action.target_id;
              logs.push({
                message: tWithParams('gameLog.shadowTarget', { name: getName(action.target_id) }, lang),
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
                const copiedRoleName = getRoleName(target.role as any);
                logs.push({
                  message: tWithParams('gameLog.copySuccess', { name: getName(action.target_id), role: copiedRoleName }, lang),
                  viewer_ids: [player.id],
                  tag: 'PRIVATE'
                });
              }
            }
            break;

          case 'fate_transfer': // 命运转移者
            if (action.target_id) {
              const target = players.find(p => p.id === action.target_id);
              if (target) {
                updates[player.id].fate_target_id = action.target_id;
                // 同时更新目标的 fate_target_id 指向自己（双向绑定）
                if (updates[action.target_id]) {
                  updates[action.target_id].fate_target_id = player.id;
                } else {
                  updates[action.target_id] = {
                    ...target,
                    fate_target_id: player.id
                  };
                }
                logs.push({
                  message: tWithParams('gameLog.fateTransferred', { name: getName(action.target_id) }, lang),
                  viewer_ids: [player.id],
                  tag: 'PRIVATE'
                });
                logs.push({
                  message: tWithParams('gameLog.fateTransferredTarget', { name: getName(player.id) }, lang),
                  viewer_ids: [action.target_id],
                  tag: 'PRIVATE'
                });
              }
            }
            break;

          case 'predict_vote': // 心灵胜者
            // 需要从 action 中获取预测的投票者和目标
            // 这里需要扩展 night_actions 表或使用其他方式存储预测信息
            // 暂时使用 target_id 作为预测的目标，predicted_voter_id 需要从其他地方获取
            if (action.target_id) {
              logs.push({
                message: t('gameLog.predictionRecorded', lang),
                viewer_ids: [player.id],
                tag: 'PRIVATE'
              });
            }
            break;

          case 'victory_steal': // 胜利夺取者
            if (action.target_id) {
              const target = players.find(p => p.id === action.target_id);
              if (target) {
                updates[player.id].flags.victory_steal_target_id = action.target_id;
                updates[player.id].flags.victory_steal_role = target.role;
                  logs.push({
                    message: tWithParams('gameLog.victoryStealLocked', { name: getName(action.target_id) }, lang),
                    viewer_ids: [player.id],
                    tag: 'PRIVATE'
                  });
              }
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
        { success: false, error: 'error.updatePlayerFailed', details: updateError.message },
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
      message: 'success.nightProcessed'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'error.serverError', details: error.message },
      { status: 500 }
    );
  }
}

