'use client';

import { useState } from 'react';
import { ALL_ROLES, ROLE_CONFIG, BOARDS } from '@/lib/game/roles';
import type { BoardType } from '@/lib/game/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { getRoleName, getRoleTag, getRoleDescription } from '@/lib/game/roleTranslations';

export default function GameRules() {
  const { t } = useTranslation();
  const [showRules, setShowRules] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null);

  if (!showRules) {
    return (
      <button
        onClick={() => setShowRules(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-50"
      >
        📖 {t('gameRules.title')}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-yellow-400">📖 {t('gameRules.title')}</h2>
          <button
            onClick={() => setShowRules(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 游戏概述 */}
          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-3">{t('gameRules.gameOverview')}</h3>
            <p className="text-gray-300 leading-relaxed">
              {t('gameManual.overviewDesc')}
            </p>
          </section>

          {/* 游戏流程 */}
          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">{t('gameRules.gameFlow')}</h3>
            <div className="space-y-2 text-gray-300">
              <p><strong className="text-red-400">{t('gameRules.nightPhase')}：</strong>{t('gameRules.nightPhaseDesc')}</p>
              <p><strong className="text-yellow-400">{t('gameRules.dayPhase')}：</strong>{t('gameRules.dayPhaseDesc')}</p>
              <p><strong className="text-purple-400">{t('gameRules.victoryCondition')}：</strong>{t('gameRules.victoryConditionDesc')}</p>
            </div>
          </section>

          {/* 角色分类 */}
          <section>
            <h3 className="text-xl font-bold text-purple-400 mb-3">{t('gameRules.roleCategories')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold text-blue-300 mb-2">{t('gameRules.activeControl')}</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• {getRoleName('技能观测者')}</li>
                  <li>• {getRoleName('利他守护者')}</li>
                  <li>• {getRoleName('投票阻断者')}</li>
                  <li>• {getRoleName('沉默制裁者')}</li>
                  <li>• {getRoleName('同盟者')}</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold text-green-300 mb-2">{t('gameRules.passiveDefense')}</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• {getRoleName('减票守护者')}</li>
                  <li>• {getRoleName('双票使者')}</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold text-yellow-300 mb-2">{t('gameRules.situationVictory')}</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• {getRoleName('三人王者')}</li>
                  <li>• {getRoleName('集票胜者')}</li>
                  <li>• {getRoleName('平票赢家')}</li>
                  <li>• {getRoleName('影子胜者')}</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold text-orange-300 mb-2">{t('gameRules.counterVictory')}</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• {getRoleName('平票终结者')}</li>
                  <li>• {getRoleName('免票胜者')}</li>
                  <li>• {getRoleName('票数平衡者')}</li>
                  <li>• {getRoleName('多选胜者')}</li>
                  <li>• {getRoleName('心灵胜者')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 板子选择 */}
          <section>
            <h3 className="text-xl font-bold text-indigo-400 mb-3">{t('gameRules.boards')}</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedBoard(selectedBoard === 'fate' ? null : 'fate')}
                className={`w-full p-4 rounded-lg border-2 text-left ${
                  selectedBoard === 'fate'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <h4 className="font-bold text-purple-400 mb-1">{t('gameRules.boardFate')}</h4>
                <p className="text-sm text-gray-400">{t('gameRules.boardFateDesc')}</p>
              </button>
              <button
                onClick={() => setSelectedBoard(selectedBoard === 'balance' ? null : 'balance')}
                className={`w-full p-4 rounded-lg border-2 text-left ${
                  selectedBoard === 'balance'
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <h4 className="font-bold text-blue-400 mb-1">{t('gameRules.boardBalance')}</h4>
                <p className="text-sm text-gray-400">{t('gameRules.boardBalanceDesc')}</p>
              </button>
              <button
                onClick={() => setSelectedBoard(selectedBoard === 'strategy' ? null : 'strategy')}
                className={`w-full p-4 rounded-lg border-2 text-left ${
                  selectedBoard === 'strategy'
                    ? 'border-orange-500 bg-orange-900/20'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <h4 className="font-bold text-orange-400 mb-1">{t('gameRules.boardStrategy')}</h4>
                <p className="text-sm text-gray-400">{t('gameRules.boardStrategyDesc')}</p>
              </button>
            </div>
            {selectedBoard && (
              <div className="mt-4 p-4 bg-gray-800 rounded">
                <h4 className="font-bold text-white mb-2">{t('gameManual.includedRoles')}：</h4>
                <div className="flex flex-wrap gap-2">
                  {BOARDS[selectedBoard].map((role) => (
                    <span
                      key={role}
                      className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300"
                      title={getRoleDescription(role)}
                    >
                      {getRoleName(role)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 角色详情 */}
          <section>
            <h3 className="text-xl font-bold text-yellow-400 mb-3">{t('gameRules.allRoles')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {ALL_ROLES.map((role) => {
                const config = ROLE_CONFIG[role];
                return (
                  <div
                    key={role}
                    className="bg-gray-800 p-3 rounded border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-white text-sm">{getRoleName(role)}</h4>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                        {getRoleTag(role)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{getRoleDescription(role)}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 特殊规则 */}
          <section>
            <h3 className="text-xl font-bold text-red-400 mb-3">{t('gameRules.specialRules')}</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>• <strong>{t('gameRules.deadlockRule')}：</strong>{t('gameRules.deadlockDesc')}</p>
              <p>• <strong>{t('gameRules.tieRule')}：</strong>{t('gameRules.tieDesc')}</p>
              <p>• <strong>{t('gameRules.firstNightRule')}：</strong>{t('gameRules.firstNightDesc')}</p>
              <p>• <strong>{t('gameRules.skillOrderRule')}：</strong>{t('gameRules.skillOrderDesc')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
