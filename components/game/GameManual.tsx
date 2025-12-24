'use client';

import { useState } from 'react';
import { BOARDS, ROLE_CONFIG, type BoardType } from '@/lib/game/roles';

interface GameManualProps {
  onClose: () => void;
  boardType?: BoardType;
}

// 获取技能描述
function getSkillDescription(role: string, config: any): JSX.Element {
  const skillDescriptions: Record<string, string> = {
    '技能观测者': '夜晚选择一名玩家，查看他当晚使用的技能类型',
    '利他守护者': '夜晚选择一名玩家，保护他免受所有技能影响',
    '投票阻断者': '夜晚选择一名玩家，阻止他在接下来的白天投票',
    '沉默制裁者': '夜晚选择一名玩家，禁言他（无法发言）',
    '同盟者': '第一夜选择一名玩家，与他建立同盟（共享胜利）',
    '减票守护者': '被动：每次被投票时，得票数-1',
    '双票使者': '被动：你的投票权重为2票',
    '三人王者': '胜利：当仅剩3名存活玩家时获胜',
    '集票胜者': '胜利：白天投票时获得超过2/3的票数',
    '平票赢家': '胜利：平票时，如果你在平票玩家中，立即获胜',
    '影子胜者': '第一夜选择一名玩家，如果他被投票出局，你获胜',
    '平票终结者': '胜利：连续N局平票（N=总人数/2向上取整）',
    '免票胜者': '胜利：连续N局未被投票（N=总人数/2向上取整）',
    '票数平衡者': '胜利：连续N局得票数相同（N=总人数/2向上取整）',
    '多选胜者': '胜利：连续投死N个不同玩家（N=总人数/2向上取整）',
    '反向投票者': '被动：被投票出局时，随机选择一名投票者代替出局',
    '均衡守护者': '主动：平票时，可以选择一名玩家处决（一次性）',
    '命运复制者': '第一夜选择一名玩家，复制他的角色技能（目标死你也死）',
    '心灵胜者': '夜晚预测一名玩家的投票，连续预测成功N次获胜（N=总人数/2向上取整）',
    '命运转移者': '夜晚选择一名玩家，与他调换命运（一方被投，另一方代替出局）',
    '投票回收者': '主动：可以存储最多3张投票，在后续回合使用',
    '胜利夺取者': '夜晚选择一名玩家，如果他达成特殊胜利条件，你代替他获胜'
  };

  const description = skillDescriptions[role] || config.desc;

  return (
    <p className="text-xs text-blue-300 leading-relaxed">{description}</p>
  );
}

export default function GameManual({ onClose, boardType }: GameManualProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'roles' | 'boards'>('basic');

  // 如果指定了板子，显示该板子的详细信息
  if (boardType) {
    const roles = BOARDS[boardType];
    const boardInfo = {
      fate: {
        name: '命运之轮',
        desc: '以命运操作与投票预测为主题，通过复杂的投票与角色互动来推动胜利',
        theme: '命运与预测'
      },
      balance: {
        name: '均衡法则',
        desc: '围绕平票和投票平衡进行设计，投票机制成为博弈的核心',
        theme: '平衡与投票'
      },
      strategy: {
        name: '策略之巅',
        desc: '强调投票策略和角色协同作用，通过精密策划和团队协作达成胜利',
        theme: '策略与协作'
      },
      custom: {
        name: '自定义',
        desc: '从所有22个角色中随机分配',
        theme: '随机组合'
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
              <p className="text-sm text-gray-500 mt-1">主题：{info.theme}</p>
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
              本板子包含的角色 ({roles.length}个)
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
                      <h4 className="font-bold text-white text-lg">{role}</h4>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded whitespace-nowrap">
                        {config.tag}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-2">
                      {config.desc}
                    </p>
                    
                    {/* 技能说明 */}
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">技能说明：</p>
                      {getSkillDescription(role, config)}
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
              已了解，开始游戏
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
          <h2 className="text-3xl font-bold text-yellow-400">📖 游戏说明书</h2>
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
            基础规则
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'roles'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            角色概览
          </button>
          <button
            onClick={() => setActiveTab('boards')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'boards'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            游戏板子
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-bold text-blue-400 mb-3">游戏概述</h3>
                <div className="space-y-3 text-gray-300">
                  <p>
                    <strong className="text-yellow-400">权谋决战</strong>是一款支持4-12人的社交推理游戏。
                    每个玩家扮演一个独特的角色，通过夜晚技能和白天投票来达成各自的胜利条件。
                  </p>
                  <p>
                    游戏分为<strong className="text-purple-400">夜晚</strong>和<strong className="text-yellow-400">白天</strong>两个阶段，
                    交替进行直到有玩家达成胜利条件或游戏结束。
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-green-400 mb-3">游戏流程</h3>
                <div className="space-y-3">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-red-400 mb-2">🌙 夜晚阶段</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>有主动技能的玩家可以发动技能</li>
                      <li>技能按固定顺序处理，确保公平性</li>
                      <li>房主确认所有玩家行动后可以结算夜晚</li>
                    </ul>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-400 mb-2">☀️ 白天阶段</h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>所有存活玩家进行投票</li>
                      <li>得票最多者被处决（平票则无人出局）</li>
                      <li>房主确认所有玩家投票后可以结算白天</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-400 mb-3">胜利条件</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>• 每个角色都有独特的胜利条件，达成即可获胜</p>
                  <p>• 胜利条件分为<strong className="text-orange-400">局面型</strong>和<strong className="text-blue-400">计数型</strong>两种</p>
                  <p>• 游戏也可能因死局（连续3次相同情况）而结束</p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-orange-400 mb-3">特殊规则</h3>
                <div className="space-y-2 text-gray-300 text-sm">
                  <p>• <strong>平票处理：</strong>平票时无人出局，但【平票赢家】可以立即获胜</p>
                  <p>• <strong>第一夜限制：</strong>部分角色的技能只能在第一夜使用</p>
                  <p>• <strong>死局判定：</strong>连续3次出现相同情况，游戏自动结束</p>
                  <p>• <strong>技能顺序：</strong>夜晚技能按固定顺序处理，确保游戏公平</p>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">
                游戏共有22个角色，分为4个类别。每个板子包含13个不同的角色。
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-300 mb-3">主动与控制 (5个)</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 技能观测者 - 查看目标技能</li>
                    <li>• 利他守护者 - 保护目标</li>
                    <li>• 投票阻断者 - 阻止投票</li>
                    <li>• 沉默制裁者 - 禁言目标</li>
                    <li>• 同盟者 - 第一夜绑定</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-green-300 mb-3">被动与防御 (2个)</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 减票守护者 - 减少得票</li>
                    <li>• 双票使者 - 投票权重×2</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-yellow-300 mb-3">局面型胜利 (4个)</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 三人王者 - 仅剩3人时获胜</li>
                    <li>• 集票胜者 - 获得2/3票数</li>
                    <li>• 平票赢家 - 平票时获胜</li>
                    <li>• 影子胜者 - 目标被投出</li>
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-300 mb-3">计数型胜利 (11个)</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• 平票终结者 - 连续平票</li>
                    <li>• 免票胜者 - 连续未被投票</li>
                    <li>• 票数平衡者 - 连续得票相同</li>
                    <li>• 多选胜者 - 连续投死不同人</li>
                    <li>• 心灵胜者 - 连续预测成功</li>
                    <li>• 以及其他6个特殊角色...</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'boards' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">
                游戏提供3个预设板子和1个自定义选项，每个板子包含13个不同的角色。
              </p>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-5 rounded-lg border border-purple-500/50">
                  <h4 className="font-bold text-purple-400 text-lg mb-2">命运之轮</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    以命运操作与投票预测为主题，通过复杂的投票与角色互动来推动胜利
                  </p>
                  <p className="text-xs text-gray-500">包含：命运复制者、命运转移者、心灵胜者等</p>
                </div>

                <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-5 rounded-lg border border-blue-500/50">
                  <h4 className="font-bold text-blue-400 text-lg mb-2">均衡法则</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    围绕平票和投票平衡进行设计，投票机制成为博弈的核心
                  </p>
                  <p className="text-xs text-gray-500">包含：均衡守护者、平票赢家、平票终结者等</p>
                </div>

                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 p-5 rounded-lg border border-orange-500/50">
                  <h4 className="font-bold text-orange-400 text-lg mb-2">策略之巅</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    强调投票策略和角色协同作用，通过精密策划和团队协作达成胜利
                  </p>
                  <p className="text-xs text-gray-500">包含：投票回收者、胜利夺取者、集票胜者等</p>
                </div>

                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                  <h4 className="font-bold text-gray-400 text-lg mb-2">自定义</h4>
                  <p className="text-gray-300 text-sm">
                    从所有22个角色中随机分配，适合想要体验所有角色的玩家
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
            已了解，选择板子
          </button>
        </div>
      </div>
    </div>
  );
}
