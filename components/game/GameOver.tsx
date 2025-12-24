'use client';

import { useState } from 'react';
import type { Player } from '@/types/game';
import { useTranslation } from '@/hooks/useTranslation';
import { getRoleName } from '@/lib/game/roleTranslations';
import BoardSelector from './BoardSelector';
import { translateError } from '@/lib/i18n/errorHandler';

interface GameOverProps {
  winner?: {
    id: number;
    name: string;
    role: string;
    reason: string;
  };
  players: Player[];
  roomCode: string;
  isHost: boolean;
  myPlayerId?: number | null;
  onRestart: () => void;
}

export default function GameOver({ winner, players, roomCode, isHost, myPlayerId, onRestart }: GameOverProps) {
  const { t } = useTranslation({ playerId: myPlayerId });
  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const alivePlayers = players.filter(p => p.is_alive);
  const deadPlayers = players.filter(p => !p.is_alive);

  const handleRestart = async (boardType: string) => {
    if (!myPlayerId) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${roomCode}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardType,
          playerId: myPlayerId
        })
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result.error ? translateError(result.error, result.errorParams, myPlayerId) : t('error.restartFailed');
        throw new Error(errorMsg);
      }

      // 成功重启后刷新数据
      onRestart();
      setShowBoardSelector(false);
    } catch (err: any) {
      setError(err.message || t('error.restartFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-700">
        {/* 胜利者显示 */}
        {winner ? (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">{t('gameOver.title')}</h1>
            <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-6 rounded-lg border-2 border-yellow-500">
              <p className="text-2xl font-bold text-yellow-300 mb-2">{winner.name}</p>
              <p className="text-lg text-yellow-400 mb-1">{t('gameOver.role')}：{getRoleName(winner.role as any)}</p>
              <p className="text-sm text-yellow-300/80">{winner.reason}</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">💀</div>
            <h1 className="text-4xl font-bold text-gray-400 mb-2">{t('gameOver.title')}</h1>
            <p className="text-lg text-gray-500">{t('gameOver.noWinner')}</p>
          </div>
        )}

        {/* 玩家列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 存活玩家 */}
          <div>
            <h3 className="text-green-400 font-bold mb-3 text-sm uppercase tracking-wider">
              {t('gameOver.alivePlayers')} ({alivePlayers.length})
            </h3>
            <div className="space-y-2">
              {alivePlayers.map((p) => (
                <div
                  key={p.id}
                  className="bg-green-900/30 border border-green-500/50 p-3 rounded flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-green-400 ml-auto">({p.role ? getRoleName(p.role as any) : '-'})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 已出局玩家 */}
          <div>
            <h3 className="text-red-400 font-bold mb-3 text-sm uppercase tracking-wider">
              {t('gameOver.deadPlayers')} ({deadPlayers.length})
            </h3>
            <div className="space-y-2">
              {deadPlayers.map((p) => (
                <div
                  key={p.id}
                  className="bg-red-900/30 border border-red-500/50 p-3 rounded flex items-center gap-2 opacity-70"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="font-medium line-through">{p.name}</span>
                  <span className="text-xs text-red-400 ml-auto">({p.role ? getRoleName(p.role as any) : '-'})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 重新开始提示 */}
        <div className="text-center pt-4 border-t border-gray-700 space-y-4">
          <p className="text-gray-400 text-sm">
            {t('gameOver.thanks')}
          </p>
          
          {/* 房主可以再来一局 */}
          {isHost && (
            <div className="mt-4">
              <button
                onClick={() => setShowBoardSelector(true)}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('common.loading') : t('gameOver.playAgain')}
              </button>
              {error && (
                <p className="mt-2 text-red-400 text-sm">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 板子选择器 */}
      {showBoardSelector && (
        <BoardSelector
          onSelect={(boardType) => handleRestart(boardType)}
          onCancel={() => {
            setShowBoardSelector(false);
            setError('');
          }}
          loading={loading}
        />
      )}
    </div>
  );
}
