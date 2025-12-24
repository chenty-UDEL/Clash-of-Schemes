'use client';

import { useState } from 'react';
import type { Player } from '@/types/game';
import { getRoleConfig } from '@/lib/game/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { getRoleName, getRoleDescription } from '@/lib/game/roleTranslations';

interface GameTipsProps {
  myPlayer: Player | null;
  roomState: string;
  isHost: boolean;
}

export default function GameTips({ myPlayer, roomState, isHost }: GameTipsProps) {
  const { t } = useTranslation({ playerId: myPlayer?.id });
  const [showTips, setShowTips] = useState(false);

  if (!myPlayer) return null;

  const roleConfig = myPlayer.role ? getRoleConfig(myPlayer.role) : null;
  const isNight = roomState.startsWith('NIGHT');
  const isDay = roomState.startsWith('DAY');
  const isLobby = roomState === 'LOBBY';

  const tips = [];

  if (isLobby) {
    if (isHost) {
      tips.push(`💡 ${t('gameTips.hostWait')}`);
      tips.push(`📋 ${t('gameTips.hostSelectBoard')}`);
    } else {
      tips.push(`💡 ${t('gameTips.waitHost')}`);
      tips.push(`👥 ${t('gameTips.currentPlayers')}`);
    }
  } else if (isNight) {
    if (myPlayer.role && roleConfig) {
      const actionType = getActionType(myPlayer.role, roomState);
      if (actionType) {
        tips.push(`🌙 ${t('gameTips.nightCanUse', { role: getRoleName(myPlayer.role) })}`);
        tips.push(`📖 ${getRoleDescription(myPlayer.role as any)}`);
        if (myPlayer.role === '命运复制者' && !myPlayer.copied_role) {
          tips.push(`⚠️ ${t('gameTips.fateCopierFirstNight')}`);
        }
        if (myPlayer.role === '同盟者' || myPlayer.role === '影子胜者') {
          tips.push(`⚠️ ${t('gameTips.firstNightOnly')}`);
        }
      } else {
        tips.push(`🌙 ${t('gameTips.nightNoSkill')}`);
        tips.push(`💤 ${t('gameTips.nightWait')}`);
      }
    }
  } else if (isDay) {
    tips.push(`☀️ ${t('gameTips.dayPhase')}`);
    if (myPlayer.flags?.cannot_vote) {
      tips.push(`🚫 ${t('gameTips.cannotVote')}`);
    }
    if (myPlayer.flags?.is_silenced) {
      tips.push(`🔇 ${t('gameTips.silenced')}`);
    }
    if (myPlayer.role === '投票回收者') {
      tips.push(`💾 ${t('gameTips.voteCollectorStore')}`);
      tips.push(`📊 ${t('gameTips.voteCollectorCurrent', { count: myPlayer.stored_votes || 0 })}`);
    }
    if (myPlayer.role === '均衡守护者' && !myPlayer.balance_guard_used) {
      tips.push(`⚖️ ${t('gameTips.balanceGuardCanBreak')}`);
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
        <span>{t('gameTips.title')}</span>
        <span className="text-xs">{showTips ? '▼' : '▶'}</span>
      </button>
      
      {showTips && (
        <div className="absolute top-8 left-0 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl z-50 min-w-[300px] max-w-md">
          <h4 className="font-bold text-yellow-400 mb-2">💡 {t('gameTips.currentTips')}</h4>
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

