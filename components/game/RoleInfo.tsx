'use client';

import { getRoleConfig } from '@/lib/game/roles';
import type { Player } from '@/types/game';

interface RoleInfoProps {
  player: Player;
}

export default function RoleInfo({ player }: RoleInfoProps) {
  if (!player.role) return null;

  const config = getRoleConfig(player.role);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-yellow-400">{player.role}</h3>
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {config.tag}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-300 mt-2 leading-relaxed">{config.desc}</p>
      
      {/* 特殊状态显示 */}
      {player.role === '投票回收者' && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-purple-300">
            存储的票数: <span className="font-bold">{player.stored_votes || 0}/3</span>
          </p>
        </div>
      )}
      
      {player.role === '命运复制者' && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          {player.copied_role ? (
            <p className="text-xs text-blue-300">
              已复制角色: <span className="font-bold">{player.copied_role}</span>
              {player.copied_from_id && (
                <span className="text-blue-400 ml-2">
                  (来自玩家 {player.copied_from_id})
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-gray-500">等待第一夜复制角色...</p>
          )}
        </div>
      )}
      
      {player.role === '命运转移者' && player.fate_target_id && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-purple-300">
            命运已转移: 与玩家 {player.fate_target_id} 命运调换
          </p>
        </div>
      )}
      
      {player.role === '胜利夺取者' && player.flags?.victory_steal_target_id && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-red-300">
            ⚠️ 已锁定目标: 玩家 {player.flags.victory_steal_target_id} 的特殊胜利条件
          </p>
        </div>
      )}
      
      {player.role === '反向投票者' && player.reverse_vote_used && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-red-300">⚠️ 技能已使用</p>
        </div>
      )}
      
      {player.role === '均衡守护者' && player.balance_guard_used && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-red-300">⚠️ 技能已使用</p>
        </div>
      )}
    </div>
  );
}

