'use client';

import { useState } from 'react';
import { BOARDS, ROLE_CONFIG, type BoardType } from '@/lib/game/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { getRoleName, getRoleTag, getRoleDescription } from '@/lib/game/roleTranslations';

interface BoardSelectorProps {
  onSelect: (boardType: BoardType) => void;
  onCancel: () => void;
  loading?: boolean;
  playerId?: number | null;
}

export default function BoardSelector({ onSelect, onCancel, loading, playerId }: BoardSelectorProps) {
  const { t } = useTranslation({ playerId });
  const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null);

  const boardInfo: Record<BoardType, { name: string; desc: string; color: string }> = {
    fate: {
      name: t('gameManual.boardFate'),
      desc: t('gameManual.boardFateDesc'),
      color: 'from-purple-600 to-indigo-600'
    },
    balance: {
      name: t('gameManual.boardBalance'),
      desc: t('gameManual.boardBalanceDesc'),
      color: 'from-blue-600 to-cyan-600'
    },
    strategy: {
      name: t('gameManual.boardStrategy'),
      desc: t('gameManual.boardStrategyDesc'),
      color: 'from-orange-600 to-red-600'
    },
    custom: {
      name: t('gameManual.customBoard'),
      desc: t('gameManual.customBoardDesc'),
      color: 'from-gray-600 to-gray-800'
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">{t('lobby.selectBoard')}</h2>
          <p className="text-gray-400 text-sm">{t('gameManual.boardsDescription')}</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(BOARDS) as BoardType[]).map((boardType) => {
            const info = boardInfo[boardType];
            const roles = BOARDS[boardType];
            const isSelected = selectedBoard === boardType;

            return (
              <div
                key={boardType}
                onClick={() => setSelectedBoard(boardType)}
                className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className={`h-2 w-full rounded mb-4 bg-gradient-to-r ${info.color}`}></div>
                <h3 className="text-xl font-bold text-white mb-2">{info.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{info.desc}</p>
                
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">{t('gameManual.includedRoles')} ({roles.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {roles.slice(0, 6).map((role) => {
                      return (
                        <span
                          key={role}
                          className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300"
                          title={getRoleDescription(role, playerId)}
                        >
                          {getRoleName(role, playerId)}
                        </span>
                      );
                    })}
                    {roles.length > 6 && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                        +{roles.length - 6}...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 font-bold disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => selectedBoard && onSelect(selectedBoard)}
            disabled={!selectedBoard || loading}
            className={`flex-1 px-6 py-3 rounded-lg font-bold shadow-lg transition ${
              selectedBoard && !loading
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            {loading ? t('common.loading') : t('lobby.startGame')}
          </button>
        </div>
      </div>
    </div>
  );
}

