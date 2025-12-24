'use client';

import { useState } from 'react';
import { BOARDS, ROLE_CONFIG, type BoardType } from '@/lib/game/roles';

interface BoardSelectorProps {
  onSelect: (boardType: BoardType) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function BoardSelector({ onSelect, onCancel, loading }: BoardSelectorProps) {
  const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null);

  const boardInfo = {
    fate: {
      name: '命运之轮',
      desc: '以命运操作与投票预测为主题，通过复杂的投票与角色互动来推动胜利',
      color: 'from-purple-600 to-indigo-600'
    },
    balance: {
      name: '均衡法则',
      desc: '围绕平票和投票平衡进行设计，投票机制成为博弈的核心',
      color: 'from-blue-600 to-cyan-600'
    },
    strategy: {
      name: '策略之巅',
      desc: '强调投票策略和角色协同作用，通过精密策划和团队协作达成胜利',
      color: 'from-orange-600 to-red-600'
    },
    custom: {
      name: '自定义',
      desc: '从所有22个角色中随机分配',
      color: 'from-gray-600 to-gray-800'
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">选择游戏板子</h2>
          <p className="text-gray-400 text-sm">每个板子包含13个不同的角色</p>
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
                  <p className="text-xs text-gray-500 mb-2">包含角色 ({roles.length}个):</p>
                  <div className="flex flex-wrap gap-2">
                    {roles.slice(0, 6).map((role) => {
                      const config = ROLE_CONFIG[role];
                      return (
                        <span
                          key={role}
                          className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300"
                          title={config.desc}
                        >
                          {role}
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
            取消
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
            {loading ? '开始中...' : '查看板子详情'}
          </button>
        </div>
      </div>
    </div>
  );
}

