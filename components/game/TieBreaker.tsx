'use client';

import { useState } from 'react';
import type { Player } from '@/types/game';
import { useTranslation } from '@/hooks/useTranslation';

interface TieBreakerProps {
  roomCode: string;
  myPlayer: Player;
  candidates: number[];
  players: Player[];
  onBreak: () => void;
}

export default function TieBreaker({
  roomCode,
  myPlayer,
  candidates,
  players,
  onBreak
}: TieBreakerProps) {
  const { t } = useTranslation({ playerId: myPlayer.id });
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBreakTie = async () => {
    if (!selectedCandidate) {
      setError(t('gameUI.selectEliminationTarget'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/actions/break-tie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerId: myPlayer.id,
          targetId: parseInt(selectedCandidate)
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || result.details || t('error.breakTieFailed'));
      }

      // 成功打破平局后刷新数据
      onBreak();
    } catch (err: any) {
      setError(err.message || t('error.breakTieFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-orange-900/30 border-2 border-orange-500 p-4 rounded-lg">
      <h4 className="text-orange-400 font-bold mb-2">⚖️ {t('gameUI.balanceGuardian')} - {t('gameUI.breakTie')}</h4>
      <p className="text-sm text-orange-300 mb-3">
        {t('gameUI.tieOccurred')}
      </p>
      
      <select
        className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 mb-3"
        value={selectedCandidate}
        onChange={(e) => setSelectedCandidate(e.target.value)}
      >
        <option value="">-- {t('gameUI.selectEliminationTarget')} --</option>
        {candidates.map((id) => {
          const candidatePlayer = players.find(p => p.id === id);
          return (
            <option key={id} value={id}>
              {candidatePlayer?.name || `${t('gameUI.player')} ${id}`}
            </option>
          );
        })}
      </select>

      <button
        onClick={handleBreakTie}
        disabled={!selectedCandidate || loading}
        className="w-full bg-orange-600 hover:bg-orange-700 p-2 rounded font-bold disabled:opacity-50"
      >
        {loading ? t('common.loading') : t('gameUI.breakTie')}
      </button>

      {error && (
        <div className="mt-2 text-red-400 text-sm text-center">{error}</div>
      )}
    </div>
  );
}

