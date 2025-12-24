'use client';

import { useState, useEffect } from 'react';
import type { Player, GameLog } from '@/types/game';
import TieBreaker from './TieBreaker';
import { useTranslation } from '@/hooks/useTranslation';
import { translateError } from '@/lib/i18n/errorHandler';

interface DayPhaseProps {
  roomCode: string;
  myPlayer: Player;
  players: Player[];
  logs: GameLog[];
  onVoteSubmit: () => void;
}

export default function DayPhase({
  roomCode,
  myPlayer,
  players,
  logs,
  onVoteSubmit
}: DayPhaseProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [storedVotes, setStoredVotes] = useState(0);
  const [useStoredVotes, setUseStoredVotes] = useState(false);
  const [isTie, setIsTie] = useState(false);
  const [tieCandidates, setTieCandidates] = useState<number[]>([]);

  const alivePlayers = players.filter(p => p.is_alive);
  const myLogs = logs.filter(l => 
    l.tag === 'PUBLIC' || (myPlayer && l.viewer_ids?.includes(myPlayer.id))
  );
  const cannotVote = myPlayer.flags?.cannot_vote;
  const { t } = useTranslation();
  const isVoteCollector = myPlayer.role === '投票回收者';
  const isBalanceGuard = myPlayer.role === '均衡守护者' && !myPlayer.balance_guard_used;
  const maxStoredVotes = 3;

  // 检查是否平票（需要等待所有人投票后）
  useEffect(() => {
    const checkTie = async () => {
      // 只有在已经投票后才检查平票
      if (!hasVoted) return;
      
      try {
        const res = await fetch(`/api/rooms/${roomCode}/tie-info`);
        const result = await res.json();
        if (result.success) {
          setIsTie(result.isTie);
          setTieCandidates(result.candidates || []);
        }
      } catch (err) {
        console.error('检查平票失败:', err);
      }
    };

    // 定期检查（每2秒），但只在已投票后
    const interval = setInterval(checkTie, 2000);
    checkTie();

    return () => clearInterval(interval);
  }, [roomCode, hasVoted]);

  // 获取存储的票数
  useEffect(() => {
    if (myPlayer.stored_votes !== undefined) {
      setStoredVotes(myPlayer.stored_votes);
    }
  }, [myPlayer.stored_votes]);

  const handleStoreVote = async () => {
    if (!isVoteCollector) return;
    if (storedVotes >= maxStoredVotes) {
      setError(`最多只能存储 ${maxStoredVotes} 张票`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/votes/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerId: myPlayer.id
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || '存储失败');
      }

      setStoredVotes(result.data.storedVotes || storedVotes + 1);
      onVoteSubmit();
    } catch (err: any) {
      setError(err.message || '存储失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          voterId: myPlayer.id,
          targetId: selectedTargetId ? parseInt(selectedTargetId) : null,
          useStoredVotes: useStoredVotes && isVoteCollector ? storedVotes : 0
        })
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result.error ? translateError(result.error, result.errorParams) : t('error.voteFailed');
        throw new Error(errorMsg);
      }

      setHasVoted(true);
      if (useStoredVotes && isVoteCollector) {
        setStoredVotes(0);
        setUseStoredVotes(false);
      }
      onVoteSubmit();
    } catch (err: any) {
      setError(err.message || '投票失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 公告区域 */}
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 max-h-52 overflow-y-auto shadow-inner">
        <h3 className="text-gray-400 font-bold mb-2 sticky top-0 bg-gray-900 pb-2 border-b border-gray-800">
          📢 {t('gameUI.roundState')}
        </h3>
        {myLogs.length === 0 ? (
          <p className="text-gray-600 text-sm py-4 text-center">{t('tips.waiting')}</p>
        ) : (
          myLogs.map((log) => (
            <div
              key={log.id}
              className={`mb-2 p-3 rounded text-sm shadow-sm ${
                log.tag === 'PRIVATE'
                  ? 'bg-indigo-900/40 border-l-4 border-indigo-500 text-indigo-200'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {log.tag === 'PRIVATE' && (
                <span className="text-indigo-400 font-bold text-xs uppercase mr-1">
                  {t('gameUI.private')}
                </span>
              )}
              {log.message}
            </div>
          ))
        )}
      </div>

      {/* 均衡守护者打破平局 - 显示在投票区域上方，只有在平票时才显示 */}
      {isTie && isBalanceGuard && tieCandidates.length > 0 && (
        <div className="mb-4">
          <TieBreaker
            roomCode={roomCode}
            myPlayer={myPlayer}
            candidates={tieCandidates}
            players={players}
            onBreak={() => {
              onVoteSubmit();
              setIsTie(false);
              // 刷新数据以更新状态
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}
          />
        </div>
      )}

      {/* 投票提示 */}
      {!hasVoted && !cannotVote && (
        <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg mb-4">
          <p className="text-sm text-blue-300">
            💡 {t('gameUI.vote')}
          </p>
        </div>
      )}

      {/* 投票区域 */}
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-600 shadow-lg">
        <h3 className="text-lg font-bold text-yellow-500 mb-4">🗳️ 投票处决</h3>

        {hasVoted ? (
          <div className="bg-green-900/30 border border-green-600 text-green-400 font-bold p-4 rounded text-center">
            ✅ 已投票
          </div>
        ) : (
          <div className="space-y-4">
            {cannotVote && (
              <div className="bg-red-900/50 border border-red-700 p-2 rounded text-red-300 text-sm text-center">
                ⛔ 被【投票阻断者】限制
              </div>
            )}

            {/* 投票回收者特殊功能 */}
            {isVoteCollector && !cannotVote && (
              <div className="bg-purple-900/30 border border-purple-500 p-3 rounded space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-300">存储的票数: {storedVotes}/{maxStoredVotes}</span>
                  {storedVotes < maxStoredVotes && (
                    <button
                      onClick={handleStoreVote}
                      disabled={loading}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-bold disabled:opacity-50"
                    >
                      存储本回合投票
                    </button>
                  )}
                </div>
                {storedVotes > 0 && (
                  <label className="flex items-center gap-2 text-sm text-purple-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useStoredVotes}
                      onChange={(e) => setUseStoredVotes(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>同时使用所有存储的票 ({storedVotes} 张)</span>
                  </label>
                )}
              </div>
            )}

            <select
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-500"
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              disabled={!!cannotVote}
            >
              <option value="">-- 投票给谁 (不选为弃票) --</option>
              {alivePlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleSubmit}
              disabled={!!cannotVote || loading}
              className={`w-full p-3 rounded font-bold shadow-md ${
                cannotVote
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-black'
              }`}
            >
              {loading ? '提交中...' : useStoredVotes && isVoteCollector && storedVotes > 0
                ? `确认投票 (使用 ${storedVotes + 1} 张票)`
                : '确认投票'}
            </button>

            {error && (
              <div className="bg-red-900/30 border border-red-900 text-red-400 p-3 rounded text-center text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

