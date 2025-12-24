'use client';

import { useState } from 'react';
import { ALL_ROLES, ROLE_CONFIG, BOARDS } from '@/lib/game/roles';
import type { BoardType } from '@/lib/game/roles';

export default function GameRules() {
  const [showRules, setShowRules] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null);

  if (!showRules) {
    return (
      <button
        onClick={() => setShowRules(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg font-bold z-50"
      >
        📖 游戏规则
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-yellow-400">📖 游戏规则</h2>
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
            <h3 className="text-xl font-bold text-blue-400 mb-3">游戏概述</h3>
            <p className="text-gray-300 leading-relaxed">
              权谋决战是一款社交推理游戏，支持4-12人游玩。每个玩家扮演一个独特的角色，
              通过夜晚技能和白天投票来达成各自的胜利条件。游戏分为夜晚和白天两个阶段，
              夜晚使用技能，白天进行投票处决。
            </p>
          </section>

          {/* 游戏流程 */}
          <section>
            <h3 className="text-xl font-bold text-green-400 mb-3">游戏流程</h3>
            <div className="space-y-2 text-gray-300">
              <p><strong className="text-red-400">夜晚阶段：</strong>有主动技能的玩家可以发动技能</p>
              <p><strong className="text-yellow-400">白天阶段：</strong>所有玩家投票，得票最多者出局（平票则无人出局）</p>
              <p><strong className="text-purple-400">胜利条件：</strong>达成角色特定的胜利条件即可获胜</p>
            </div>
          </section>

          {/* 角色分类 */}
          <section>
            <h3 className="text-xl font-bold text-purple-400 mb-3">角色分类</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold text-blue-300 mb-2">主动与控制</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 技能观测者</li>
                  <li>• 利他守护者</li>
                  <li>• 投票阻断者</li>
                  <li>• 沉默制裁者</li>
                  <li>• 同盟者</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold text-green-300 mb-2">被动与防御</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 减票守护者</li>
                  <li>• 双票使者</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold text-yellow-300 mb-2">局面型胜利</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 三人王者</li>
                  <li>• 集票胜者</li>
                  <li>• 平票赢家</li>
                  <li>• 影子胜者</li>
                </ul>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <h4 className="font-bold text-orange-300 mb-2">计数型胜利</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 平票终结者</li>
                  <li>• 免票胜者</li>
                  <li>• 票数平衡者</li>
                  <li>• 多选胜者</li>
                  <li>• 心灵胜者</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 板子选择 */}
          <section>
            <h3 className="text-xl font-bold text-indigo-400 mb-3">游戏板子</h3>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedBoard(selectedBoard === 'fate' ? null : 'fate')}
                className={`w-full p-4 rounded-lg border-2 text-left ${
                  selectedBoard === 'fate'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <h4 className="font-bold text-purple-400 mb-1">命运之轮</h4>
                <p className="text-sm text-gray-400">以命运操作与投票预测为主题</p>
              </button>
              <button
                onClick={() => setSelectedBoard(selectedBoard === 'balance' ? null : 'balance')}
                className={`w-full p-4 rounded-lg border-2 text-left ${
                  selectedBoard === 'balance'
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <h4 className="font-bold text-blue-400 mb-1">均衡法则</h4>
                <p className="text-sm text-gray-400">围绕平票和投票平衡进行设计</p>
              </button>
              <button
                onClick={() => setSelectedBoard(selectedBoard === 'strategy' ? null : 'strategy')}
                className={`w-full p-4 rounded-lg border-2 text-left ${
                  selectedBoard === 'strategy'
                    ? 'border-orange-500 bg-orange-900/20'
                    : 'border-gray-700 bg-gray-800'
                }`}
              >
                <h4 className="font-bold text-orange-400 mb-1">策略之巅</h4>
                <p className="text-sm text-gray-400">强调投票策略和角色协同作用</p>
              </button>
            </div>
            {selectedBoard && (
              <div className="mt-4 p-4 bg-gray-800 rounded">
                <h4 className="font-bold text-white mb-2">包含角色：</h4>
                <div className="flex flex-wrap gap-2">
                  {BOARDS[selectedBoard].map((role) => (
                    <span
                      key={role}
                      className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300"
                      title={ROLE_CONFIG[role].desc}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 角色详情 */}
          <section>
            <h3 className="text-xl font-bold text-yellow-400 mb-3">所有角色（22个）</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {ALL_ROLES.map((role) => {
                const config = ROLE_CONFIG[role];
                return (
                  <div
                    key={role}
                    className="bg-gray-800 p-3 rounded border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-white text-sm">{role}</h4>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                        {config.tag}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{config.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 特殊规则 */}
          <section>
            <h3 className="text-xl font-bold text-red-400 mb-3">特殊规则</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>• <strong>死局判定：</strong>连续3次出现相同情况（存活玩家和投票结果相同），游戏自动结束</p>
              <p>• <strong>平票处理：</strong>平票时无人出局，但【平票赢家】可以立即获胜，【均衡守护者】可以打破平局</p>
              <p>• <strong>第一夜限制：</strong>【同盟者】、【影子胜者】、【命运复制者】的技能只能在第一夜使用</p>
              <p>• <strong>技能顺序：</strong>夜晚技能按固定顺序处理，确保游戏公平性</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

