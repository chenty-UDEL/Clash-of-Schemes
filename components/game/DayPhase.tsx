'use client';

import { useState } from 'react';
import type { Player, GameLog } from '@/types/game';

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

  const alivePlayers = players.filter(p => p.is_alive);
  const myLogs = logs.filter(l => 
    l.tag === 'PUBLIC' || (myPlayer && l.viewer_ids?.includes(myPlayer.id))
  );
  const cannotVote = myPlayer.flags?.cannot_vote;

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
          targetId: selectedTargetId ? parseInt(selectedTargetId) : null
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || '投票失败');
      }

      setHasVoted(true);
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
          📢 公告
        </h3>
        {myLogs.length === 0 ? (
          <p className="text-gray-600 text-sm py-4 text-center">暂无消息...</p>
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
                  [私密]
                </span>
              )}
              {log.message}
            </div>
          ))
        )}
      </div>

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
              {loading ? '提交中...' : '确认投票'}
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

