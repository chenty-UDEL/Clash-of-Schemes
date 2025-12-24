'use client';

import { useState } from 'react';
import type { Player, RoomState } from '@/types/game';
import { getRoleConfig } from '@/lib/game/roles';
import { parseRoundNumber, isFirstNight } from '@/lib/game/constants';

interface NightPhaseProps {
  roomCode: string;
  myPlayer: Player;
  players: Player[];
  roomState: RoomState;
  onActionSubmit: () => void;
}

export default function NightPhase({
  roomCode,
  myPlayer,
  players,
  roomState,
  onActionSubmit
}: NightPhaseProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [predictedVoterId, setPredictedVoterId] = useState<string>(''); // 心灵胜者：预测谁投票
  const [predictedTargetId, setPredictedTargetId] = useState<string>(''); // 心灵胜者：预测投给谁
  const [hasActed, setHasActed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roundNumber = parseRoundNumber(roomState.round_state);
  const isFirst = isFirstNight(roomState.round_state);
  const roleConfig = myPlayer.role ? getRoleConfig(myPlayer.role) : null;

  // 获取可用的行动类型
  const getActionType = (): string | null => {
    if (!myPlayer.role) return null;

    switch (myPlayer.role) {
      case '技能观测者':
        return 'check';
      case '利他守护者':
        return 'protect';
      case '沉默制裁者':
        return 'silence';
      case '投票阻断者':
        return 'block_vote';
      case '同盟者':
        return isFirst ? 'ally_bind' : null;
      case '影子胜者':
        return isFirst ? 'shadow_bind' : null;
      case '命运复制者':
        return isFirst ? 'copy_fate' : null;
      case '命运转移者':
        return 'fate_transfer';
      case '胜利夺取者':
        return 'victory_steal';
      case '心灵胜者':
        return 'predict_vote';
      case '胜利夺取者':
        return 'victory_steal';
      case '心灵胜者':
        return 'predict_vote';
      default:
        return null;
    }
  };

  const actionType = getActionType();
  const alivePlayers = players.filter(p => p.is_alive && p.id !== myPlayer.id);
  
  // 心灵胜者需要预测两个目标：预测谁投给谁
  const isMindReader = myPlayer.role === '心灵胜者';

  const handleSubmit = async () => {
    if (!actionType) return;
    
    // 心灵胜者需要两个目标
    if (isMindReader) {
      if (!predictedVoterId || !predictedTargetId) {
        setError('请选择预测的投票者和目标');
        return;
      }
    } else if (!selectedTargetId && actionType !== 'store_vote') {
      setError('请先选择目标');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          actorId: myPlayer.id,
          targetId: isMindReader ? parseInt(predictedTargetId) : (selectedTargetId ? parseInt(selectedTargetId) : null),
          actionType,
          // 心灵胜者额外参数
          predictedVoterId: isMindReader ? parseInt(predictedVoterId) : null
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || '提交失败');
      }

      setHasActed(true);
      onActionSubmit();
    } catch (err: any) {
      setError(err.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  if (!actionType) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-400">
          {myPlayer.role === '同盟者' || myPlayer.role === '影子胜者' || myPlayer.role === '命运复制者'
            ? '技能只能在第一夜发动。'
            : '今晚无主动技能，请等待天亮。'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 space-y-4">
      <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
        🔮 <span>技能发动</span>
      </h3>

      {hasActed ? (
        <div className="bg-green-900/20 border border-green-500/50 text-green-400 font-bold py-4 rounded text-center">
          ✅ 技能已提交
        </div>
      ) : (
        <div className="space-y-4">
          {roleConfig && (
            <div className="bg-gray-800 p-3 rounded text-sm text-gray-300">
              <span className="font-bold text-purple-400">{myPlayer.role}:</span> {roleConfig.desc}
            </div>
          )}

          {isMindReader ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">预测谁投票</label>
                <select
                  className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                  value={predictedVoterId}
                  onChange={(e) => setPredictedVoterId(e.target.value)}
                >
                  <option value="">-- 选择投票者 --</option>
                  {alivePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">预测投给谁</label>
                <select
                  className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                  value={predictedTargetId}
                  onChange={(e) => setPredictedTargetId(e.target.value)}
                >
                  <option value="">-- 选择目标 --</option>
                  <option value="null">弃票</option>
                  {alivePlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <select
              className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
            >
              <option value="">-- 选择目标 --</option>
              {alivePlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !selectedTargetId}
            className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '提交中...' : '确认发动'}
          </button>

          {error && (
            <div className="bg-red-900/30 border border-red-900 text-red-400 p-3 rounded text-center text-sm">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

