'use client';

import React, { useState } from 'react';
import { BOARDS, ROLE_CONFIG, type BoardType } from '@/lib/game/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { getRoleName, getRoleTag, getRoleDescription } from '@/lib/game/roleTranslations';

interface GameManualProps {
  onClose: () => void;
  boardType?: BoardType;
  playerId?: number | null;
}

// 获取技能描述（支持双语）
function getSkillDescription(role: string, config: any, t: (key: string) => string, playerId?: number | null): React.JSX.Element {
  // 尝试从翻译文件中获取技能描述
  const translationKey = `gameManual.skillDescriptions.${role}`;
  let description = t(translationKey);
  
  // 如果翻译文件中没有，使用角色描述
  if (description === translationKey || !description) {
    description = getRoleDescription(role as any, playerId);
  }

  return (
    <p className="text-xs text-blue-300 leading-relaxed">{description}</p>
  );
}

export default function GameManual({ onClose, boardType, playerId }: GameManualProps) {
  const { t } = useTranslation({ playerId });
  const [activeTab, setActiveTab] = useState<'basic' | 'roles' | 'boards'>('basic');

  // 如果指定了板子，显示该板子的详细信息
  if (boardType) {
    const roles = BOARDS[boardType];
    const boardInfo: Record<BoardType, { name: string; desc: string; theme: string }> = {
      fate: {
        name: t('gameManual.boardFate'),
        desc: t('gameManual.boardFateDesc'),
        theme: t('gameManual.boardFateTheme')
      },
      balance: {
        name: t('gameManual.boardBalance'),
        desc: t('gameManual.boardBalanceDesc'),
        theme: t('gameManual.boardBalanceTheme')
      },
      strategy: {
        name: t('gameManual.boardStrategy'),
        desc: t('gameManual.boardStrategyDesc'),
        theme: t('gameManual.boardStrategyTheme')
      },
      custom: {
        name: t('gameManual.customBoard'),
        desc: t('gameManual.customBoardDesc'),
        theme: t('gameManual.customBoardTheme')
      }
    };

    const info = boardInfo[boardType];

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
          {/* 头部 */}
          <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center z-10">
            <div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">{info.name}</h2>
              <p className="text-gray-400">{info.desc}</p>
              <p className="text-sm text-gray-500 mt-1">{t('gameManual.boardTheme')}：{info.theme}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* 板子角色列表 */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-blue-400 mb-4">
              {t('gameManual.boardRolesCount', { count: roles.length })}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => {
                const config = ROLE_CONFIG[role];
                return (
                  <div
                    key={role}
                    className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-white text-lg">{getRoleName(role, playerId)}</h4>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded whitespace-nowrap">
                        {getRoleTag(role, playerId)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-2">
                      {getRoleDescription(role, playerId)}
                    </p>
                    
                    {/* 技能说明 */}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">{t('gameManual.skillDescription')}：</p>
                      {getSkillDescription(role, config, t, playerId)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="sticky bottom-0 bg-gray-900 p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold shadow-lg"
            >
              {t('gameManual.understood')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 简易说明书（选择板子前）
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* 头部 */}
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center z-10">
          <h2 className="text-3xl font-bold text-yellow-400">📖 {t('gameManual.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 标签页 */}
        <div className="border-b border-gray-700 flex">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'basic'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {t('gameManual.basicRules')}
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'roles'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {t('gameManual.roles')}
          </button>
          <button
            onClick={() => setActiveTab('boards')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'boards'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {t('gameManual.boards')}
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-blue-400 mb-3">{t('gameManual.gameOverview')}</h3>
                <div className="space-y-3 text-gray-300">
                  <p>{t('gameManual.overviewDesc')}</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-green-400 mb-3">{t('gameManual.gameFlow')}</h3>
                <div className="space-y-3">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-red-400 mb-2">🌙 {t('gameManual.nightPhase')}</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>{t('gameManual.nightPhaseDesc')}</li>
                      <li>{t('gameManual.skillOrderDesc')}</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-400 mb-2">☀️ {t('gameManual.dayPhase')}</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>{t('gameManual.dayPhaseDesc')}</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-400 mb-3">{t('gameManual.victoryCondition')}</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>• {t('gameManual.victoryConditionDesc')}</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-orange-400 mb-3">{t('gameManual.specialRules')}</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>• <strong>{t('gameManual.tieRule')}：</strong>{t('gameManual.tieDesc')}</p>
                  <p>• <strong>{t('gameManual.firstNightRule')}：</strong>{t('gameManual.firstNightDesc')}</p>
                  <p>• <strong>{t('gameManual.deadlockRule')}：</strong>{t('gameManual.deadlockDesc')}</p>
                  <p>• <strong>{t('gameManual.skillOrderRule')}：</strong>{t('gameManual.skillOrderDesc')}</p>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">
                {t('gameManual.allRoles')}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-300 mb-3">{t('gameManual.activeControl')}</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• {getRoleName('技能观测者', playerId)}</li>
                    <li>• {getRoleName('利他守护者', playerId)}</li>
                    <li>• {getRoleName('投票阻断者', playerId)}</li>
                    <li>• {getRoleName('沉默制裁者', playerId)}</li>
                    <li>• {getRoleName('同盟者', playerId)}</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-green-300 mb-3">{t('gameManual.passiveDefense')}</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• {getRoleName('减票守护者', playerId)}</li>
                    <li>• {getRoleName('双票使者', playerId)}</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-300 mb-3">{t('gameManual.situationVictory')}</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• {getRoleName('三人王者', playerId)}</li>
                    <li>• {getRoleName('集票胜者', playerId)}</li>
                    <li>• {getRoleName('平票赢家', playerId)}</li>
                    <li>• {getRoleName('影子胜者', playerId)}</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-300 mb-3">{t('gameManual.counterVictory')}</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• {getRoleName('平票终结者', playerId)}</li>
                    <li>• {getRoleName('免票胜者', playerId)}</li>
                    <li>• {getRoleName('票数平衡者', playerId)}</li>
                    <li>• {getRoleName('多选胜者', playerId)}</li>
                    <li>• {getRoleName('心灵胜者', playerId)}</li>
                    <li>• {t('gameManual.otherSpecialRoles')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'boards' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">
                {t('gameManual.boardsDescription')}
              </p>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-5 rounded-lg border border-purple-500/50">
                  <h4 className="font-bold text-purple-400 text-lg mb-2">{t('gameManual.boardFate')}</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    {t('gameManual.boardFateDesc')}
                  </p>
                  <p className="text-xs text-gray-500">{t('gameManual.boardFateIncludes')}</p>
                </div>

                <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-5 rounded-lg border border-blue-500/50">
                  <h4 className="font-bold text-blue-400 text-lg mb-2">{t('gameManual.boardBalance')}</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    {t('gameManual.boardBalanceDesc')}
                  </p>
                  <p className="text-xs text-gray-500">{t('gameManual.boardBalanceIncludes')}</p>
                </div>

                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 p-5 rounded-lg border border-orange-500/50">
                  <h4 className="font-bold text-orange-400 text-lg mb-2">{t('gameManual.boardStrategy')}</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    {t('gameManual.boardStrategyDesc')}
                  </p>
                  <p className="text-xs text-gray-500">{t('gameManual.boardStrategyIncludes')}</p>
                </div>

                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                  <h4 className="font-bold text-gray-400 text-lg mb-2">{t('gameManual.customBoard')}</h4>
                  <p className="text-gray-300 text-sm">
                    {t('gameManual.customBoardDesc')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-gray-900 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-bold shadow-lg"
          >
            {t('gameManual.understoodAndSelectBoard')}
          </button>
        </div>
      </div>
    </div>
  );
}
