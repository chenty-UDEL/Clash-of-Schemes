'use client';

import { useState } from 'react';
import type { Player } from '@/types/game';
import { getRoleConfig } from '@/lib/game/roles';

interface GameTipsProps {
  myPlayer: Player | null;
  roomState: string;
  isHost: boolean;
}

export default function GameTips({ myPlayer, roomState, isHost }: GameTipsProps) {
  const [showTips, setShowTips] = useState(false);

  if (!myPlayer) return null;

  const roleConfig = myPlayer.role ? getRoleConfig(myPlayer.role) : null;
  const isNight = roomState.startsWith('NIGHT');
  const isDay = roomState.startsWith('DAY');
  const isLobby = roomState === 'LOBBY';

  const tips = [];

  if (isLobby) {
    if (isHost) {
      tips.push('💡 作为房主，等待所有玩家加入后可以开始游戏');
      tips.push('📋 开始游戏前需要选择一个游戏板子');
    } else {
      tips.push('💡 等待房主开始游戏');
      tips.push('👥 当前房间人数：4-12人');
    }
  } else if (isNight) {
    if (myPlayer.role && roleConfig) {
      const actionType = getActionType(myPlayer.role, roomState);
      if (actionType) {
        tips.push(`🌙 夜晚阶段：你可以使用【${myPlayer.role}】的技能`);
        tips.push(`📖 ${roleConfig.desc}`);
        if (myPlayer.role === '命运复制者' && !myPlayer.copied_role) {
          tips.push('⚠️ 注意：这是第一夜，你可以复制一个角色的技能');
        }
        if (myPlayer.role === '同盟者' || myPlayer.role === '影子胜者') {
          tips.push('⚠️ 注意：这个技能只能在第一夜使用');
        }
      } else {
        tips.push('🌙 夜晚阶段：你的角色没有主动技能');
        tips.push('💤 等待其他玩家行动...');
      }
    }
  } else if (isDay) {
    tips.push('☀️ 白天阶段：所有玩家进行投票');
    if (myPlayer.flags?.cannot_vote) {
      tips.push('🚫 你被【投票阻断者】阻止，无法投票');
    }
    if (myPlayer.flags?.is_silenced) {
      tips.push('🔇 你被【沉默制裁者】禁言，无法发言');
    }
    if (myPlayer.role === '投票回收者') {
      tips.push('💾 你可以存储投票（最多3票），或使用存储的投票');
      tips.push(`📊 当前存储：${myPlayer.stored_votes || 0}/3`);
    }
    if (myPlayer.role === '均衡守护者' && !myPlayer.balance_guard_used) {
      tips.push('⚖️ 如果出现平票，你可以使用技能打破平局');
    }
  }

  if (tips.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowTips(!showTips)}
        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
      >
        <span>💡</span>
        <span>游戏提示</span>
        <span className="text-xs">{showTips ? '▼' : '▶'}</span>
      </button>
      
      {showTips && (
        <div className="absolute top-8 left-0 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl z-50 min-w-[300px] max-w-md">
          <h4 className="font-bold text-yellow-400 mb-2">💡 当前提示</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            {tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="flex-shrink-0">{tip.split(' ')[0]}</span>
                <span>{tip.substring(tip.indexOf(' ') + 1)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function getActionType(role: string, roundState: string): string | null {
  const roundNum = parseInt(roundState.split(' ')[1]) || 1;
  const isFirst = roundNum === 1;
  
  switch (role) {
    case '技能观测者':
    case '利他守护者':
    case '沉默制裁者':
    case '投票阻断者':
    case '命运转移者':
    case '心灵胜者':
    case '胜利夺取者':
      return 'active';
    case '同盟者':
    case '影子胜者':
    case '命运复制者':
      return isFirst ? 'active' : null;
    default:
      return null;
  }
}

