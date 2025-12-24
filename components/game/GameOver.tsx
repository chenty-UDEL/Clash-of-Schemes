'use client';

import type { Player } from '@/types/game';

interface GameOverProps {
  winner?: {
    id: number;
    name: string;
    role: string;
    reason: string;
  };
  players: Player[];
}

export default function GameOver({ winner, players }: GameOverProps) {
  const alivePlayers = players.filter(p => p.is_alive);
  const deadPlayers = players.filter(p => !p.is_alive);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6 border border-gray-700">
        {/* 胜利者显示 */}
        {winner ? (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2">游戏结束</h1>
            <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-6 rounded-lg border-2 border-yellow-500">
              <p className="text-2xl font-bold text-yellow-300 mb-2">{winner.name}</p>
              <p className="text-lg text-yellow-400 mb-1">角色：{winner.role}</p>
              <p className="text-sm text-yellow-300/80">{winner.reason}</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">💀</div>
            <h1 className="text-4xl font-bold text-gray-400 mb-2">游戏结束</h1>
            <p className="text-lg text-gray-500">无人获胜</p>
          </div>
        )}

        {/* 玩家列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 存活玩家 */}
          <div>
            <h3 className="text-green-400 font-bold mb-3 text-sm uppercase tracking-wider">
              存活玩家 ({alivePlayers.length})
            </h3>
            <div className="space-y-2">
              {alivePlayers.map((p) => (
                <div
                  key={p.id}
                  className="bg-green-900/30 border border-green-500/50 p-3 rounded flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-green-400 ml-auto">({p.role})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 已出局玩家 */}
          <div>
            <h3 className="text-red-400 font-bold mb-3 text-sm uppercase tracking-wider">
              已出局 ({deadPlayers.length})
            </h3>
            <div className="space-y-2">
              {deadPlayers.map((p) => (
                <div
                  key={p.id}
                  className="bg-red-900/30 border border-red-500/50 p-3 rounded flex items-center gap-2 opacity-70"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="font-medium line-through">{p.name}</span>
                  <span className="text-xs text-red-400 ml-auto">({p.role})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 重新开始提示 */}
        <div className="text-center pt-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            游戏已结束，感谢参与！
          </p>
        </div>
      </div>
    </div>
  );
}

