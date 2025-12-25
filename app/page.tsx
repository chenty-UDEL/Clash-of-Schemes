'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Player, RoomState, GameLog } from '@/types/game';
import type { BoardType } from '@/lib/game/roles';
import { isNightPhase, isDayPhase, parseRoundNumber } from '@/lib/game/constants';
import BoardSelector from '@/components/game/BoardSelector';
import NightPhase from '@/components/game/NightPhase';
import DayPhase from '@/components/game/DayPhase';
import GameOver from '@/components/game/GameOver';
import { getRoleName } from '@/lib/game/roleTranslations';
import RoleInfo from '@/components/game/RoleInfo';
import GameRules from '@/components/game/GameRules';
import GameTips from '@/components/game/GameTips';
import GameManual from '@/components/game/GameManual';
import RoleSelector from '@/components/game/RoleSelector';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';
import { translateError } from '@/lib/i18n/errorHandler';

export default function Home() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [selectedBoardForManual, setSelectedBoardForManual] = useState<string | null>(null);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  // 获取我的玩家信息
  const getMyPlayer = () => players.find(p => p.name === name);
  const myPlayer = getMyPlayer();
  const isHost = myPlayer?.is_host;
  const myPlayerId = myPlayer?.id;

  // 国际化（使用玩家ID）
  const { t } = useTranslation({ playerId: myPlayerId });

  // 获取数据
  const fetchPlayers = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_code', code)
        .order('id');
      if (error) {
        console.error('获取玩家失败:', error);
        return;
      }
      if (data) {
        setPlayers(data as Player[]);
      }
    } catch (err) {
      console.error('获取玩家异常:', err);
    }
  };

  const fetchRoomState = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('code, round_state, board_type')
        .eq('code', code)
        .single();
      if (error) {
        console.error('获取房间状态失败:', error);
        return;
      }
      if (data) setRoomState(data as RoomState);
    } catch (err) {
      console.error('获取房间状态异常:', err);
    }
  };

  const fetchLogs = async (code: string) => {
    const { data } = await supabase
      .from('game_logs')
      .select('*')
      .eq('room_code', code)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setLogs(data as GameLog[]);
  };

  // 实时订阅
  useEffect(() => {
    if (!isInRoom || !roomCode) return;

    // 立即获取一次数据
    fetchPlayers(roomCode);
    fetchRoomState(roomCode);
    fetchLogs(roomCode);

    const channel1 = supabase
      .channel(`room-${roomCode}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `code=eq.${roomCode}`
      }, () => {
        fetchRoomState(roomCode);
        fetchPlayers(roomCode);
        fetchLogs(roomCode);
      })
      .subscribe();

    const channel2 = supabase
      .channel(`players-${roomCode}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_code=eq.${roomCode}`
      }, () => {
        fetchPlayers(roomCode);
      })
      .subscribe();

    const channel3 = supabase
      .channel(`logs-${roomCode}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_logs',
        filter: `room_code=eq.${roomCode}`
      }, () => {
        fetchLogs(roomCode);
      })
      .subscribe();

    // 定期刷新（作为备用）
    const interval = setInterval(() => {
      fetchPlayers(roomCode);
      fetchRoomState(roomCode);
    }, 2000);

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
      supabase.removeChannel(channel3);
      clearInterval(interval);
    };
  }, [isInRoom, roomCode]);

  // 创建房间
  const handleCreateRoom = async () => {
    if (!name) {
      setError(t('error.enterName'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result.error ? translateError(result.error, result.errorParams, myPlayerId) : t('error.createRoomFailed');
        throw new Error(errorMsg);
      }

      setRoomCode(result.data.roomCode);
      setIsInRoom(true);
      fetchPlayers(result.data.roomCode);
      fetchRoomState(result.data.roomCode);
    } catch (err: any) {
      setError(err.message || '创建房间失败');
    } finally {
      setLoading(false);
    }
  };

  // 加入房间
  const handleJoinRoom = async () => {
    if (!name || !roomCode) {
      setError(t('error.enterNameAndRoom'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result.error ? translateError(result.error, result.errorParams, myPlayerId) : t('error.joinFailed');
        throw new Error(errorMsg);
      }

      setIsInRoom(true);
      fetchPlayers(roomCode);
      fetchRoomState(roomCode);
      fetchLogs(roomCode);
    } catch (err: any) {
      const errorMsg = err.message ? translateError(err.message, undefined, myPlayerId) : t('error.joinFailed');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 未加入房间 - 显示登录界面
  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        {/* 语言切换器 - 右上角 */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher playerId={myPlayerId} />
        </div>
        
        <GameRules playerId={myPlayerId} />
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
            {t('game.title')}
          </h1>
          <p className="text-gray-400">{t('game.subtitle')}</p>
          <a
            href="/test"
            className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
          >
            🧪 {t('testMode.enterTestMode') || '进入测试模式'}
          </a>
        </div>

        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 border border-gray-800">
          <div>
            <label className="text-xs text-gray-400 ml-1 mb-1 block">{t('game.nickname')}</label>
            <input
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder={t('game.enterName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="flex-1 bg-blue-700 hover:bg-blue-600 p-4 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('game.createRoom')}
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">{t('game.or')}</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className="flex gap-3">
            <input
              className="flex-1 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-green-500 outline-none text-white"
              placeholder={t('game.enterRoomCode')}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="w-24 bg-green-700 hover:bg-green-600 p-4 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('game.joinRoom')}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-900 text-red-400 p-3 rounded text-center text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 已加入房间
  const alivePlayers = players.filter(p => p.is_alive);

  // 如果游戏结束，显示结束界面
  if (roomState && roomState.round_state === 'GAME OVER') {
    // 从日志中提取胜利者信息
    const winnerLog = logs.find(l => l.message.includes('游戏结束') && l.message.includes('获胜'));
    let winner: { id: number; name: string; role: string; reason: string } | undefined;
    
    if (winnerLog) {
      const winnerPlayer = players.find(p => winnerLog.message.includes(p.name));
      if (winnerPlayer) {
        winner = {
          id: winnerPlayer.id,
          name: winnerPlayer.name,
          role: winnerPlayer.role || '未知',
          reason: winnerLog.message.split('！')[1] || winnerLog.message
        };
      }
    }

    return (
      <>
        {/* 语言切换器 - 右上角，最高优先级 */}
        <div className="fixed top-4 right-4 z-[9999]">
          <LanguageSwitcher playerId={myPlayerId} />
        </div>
        <GameOver 
          winner={winner} 
          players={players}
          roomCode={roomCode}
          isHost={isHost || false}
          myPlayerId={myPlayerId}
          onRestart={() => {
            fetchRoomState(roomCode);
            fetchPlayers(roomCode);
            fetchLogs(roomCode);
          }}
        />
      </>
    );
  }

  // 如果游戏已开始，显示游戏界面
  if (roomState && roomState.round_state !== 'LOBBY') {
    const isNight = isNightPhase(roomState.round_state);
    const isDay = isDayPhase(roomState.round_state);

    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        {/* 语言切换器 - 右上角，最高优先级 */}
        <div className="fixed top-4 right-4 z-[9999]">
          <LanguageSwitcher playerId={myPlayerId} />
        </div>
        
        <GameRules playerId={myPlayerId} />
        <div className="w-full max-w-lg bg-gray-800 p-6 rounded-xl shadow-2xl space-y-6 border border-gray-700">
          {/* 游戏状态显示 */}
          <div className="border-b border-gray-700 pb-4 text-center">
            <h2 className={`text-4xl font-extrabold tracking-wider animate-pulse ${
              isNight ? 'text-red-500' : 'text-yellow-400'
            }`}>
              {roomState.round_state}
            </h2>
            <p className="text-gray-400 text-sm mt-2">{t('player.alive')}: {alivePlayers.length}</p>
          </div>

          {/* 玩家信息和角色详情 */}
          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-600 flex justify-between items-center shadow-md">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('player.players')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">{myPlayer?.name}</span>
                  <span className="text-sm text-yellow-500">
                    ({myPlayer?.role ? (() => {
                      try {
                        const { getRoleName } = require('@/lib/game/roleTranslations');
                        return getRoleName(myPlayer!.role as any);
                      } catch {
                        return myPlayer!.role;
                      }
                    })() : t('common.loading')})
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-bold border ${
                myPlayer?.is_alive
                  ? 'bg-green-900/30 border-green-500 text-green-400'
                  : 'bg-red-900/30 border-red-500 text-red-500'
              }`}>
                {myPlayer?.is_alive ? `● ${t('player.alive')}` : `💀 ${t('player.dead')}`}
              </div>
            </div>

            {/* 角色详情 */}
            {myPlayer && (
              <>
                <RoleInfo player={myPlayer} />
                <GameTips 
                  myPlayer={myPlayer} 
                  roomState={roomState.round_state}
                  isHost={isHost || false}
                />
              </>
            )}
          </div>

          {/* 游戏阶段内容 */}
          {myPlayer && myPlayer.is_alive && roomState ? (
            isNight ? (
              <NightPhase
                roomCode={roomCode}
                myPlayer={myPlayer}
                players={players}
                roomState={roomState}
                onActionSubmit={async () => {
                  fetchRoomState(roomCode);
                  fetchPlayers(roomCode);
                  fetchLogs(roomCode);
                  
                  // 测试模式：自动触发AI行动
                  if (isTestMode) {
                    try {
                      await fetch('/api/test/auto-action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ roomCode, phase: 'night' })
                      });
                      // 延迟后刷新数据
                      setTimeout(() => {
                        fetchPlayers(roomCode);
                        fetchRoomState(roomCode);
                        fetchLogs(roomCode);
                      }, 500);
                    } catch (err) {
                      console.error('AI行动失败:', err);
                    }
                  }
                }}
              />
            ) : (
              <DayPhase
                roomCode={roomCode}
                myPlayer={myPlayer}
                players={players}
                logs={logs}
                onVoteSubmit={async () => {
                  fetchRoomState(roomCode);
                  fetchPlayers(roomCode);
                  fetchLogs(roomCode);
                  
                  // 测试模式：自动触发AI投票
                  if (isTestMode) {
                    try {
                      await fetch('/api/test/auto-action', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ roomCode, phase: 'day' })
                      });
                      // 延迟后刷新数据
                      setTimeout(() => {
                        fetchPlayers(roomCode);
                        fetchRoomState(roomCode);
                        fetchLogs(roomCode);
                      }, 500);
                    } catch (err) {
                      console.error('AI投票失败:', err);
                    }
                  }
                }}
              />
            )
          ) : (
            <div className="bg-red-950/40 border-2 border-red-900/50 p-6 rounded-xl text-center space-y-4">
              <div className="text-6xl">👻</div>
              <h3 className="text-2xl font-bold text-red-500">你已出局</h3>
              <p className="text-red-300/80">
                你无法再参与投票或发动技能。<br />
                请保持沉默，静待游戏结果。
              </p>
            </div>
          )}

          {/* 游戏状态提示 */}
          {roomState.round_state !== 'GAME OVER' && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    {isNight ? '🌙 夜晚阶段' : isDay ? '☀️ 白天阶段' : '🏠 大厅'}
                  </p>
                  {isNight && (
                    <p className="text-xs text-gray-500 mt-1">
                      有技能的玩家可以发动技能，房主可以结算夜晚
                    </p>
                  )}
                  {isDay && (
                    <p className="text-xs text-gray-500 mt-1">
                      所有玩家进行投票，房主可以结算白天
                    </p>
                  )}
                </div>
                {isHost && roomState.round_state !== 'LOBBY' && (
                  <div className="text-xs text-yellow-400">
                    ⚠️ 等待所有玩家行动后再结算
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 房主控制面板 */}
          {isHost && (
            <div className="mt-8 border-t border-gray-700 pt-6">
              <p className="text-xs text-gray-500 mb-2 text-center">{t('tips.hostControl')}</p>
              {isNight ? (
                <button
                  onClick={async () => {
                    if (!confirm(t('tips.confirmProcessNight'))) return;
                    try {
                      const res = await fetch(`/api/rooms/${roomCode}/process-night`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      if (!res.ok) {
                        const result = await res.json();
                        const errorMsg = result?.error 
                          ? translateError(result.error, result.errorParams, myPlayerId) 
                          : t('tips.processNightFailed');
                        throw new Error(errorMsg);
                      }
                      fetchRoomState(roomCode);
                      fetchPlayers(roomCode);
                      fetchLogs(roomCode);
                    } catch (err: any) {
                      alert(err.message || t('tips.processNightFailed'));
                    }
                  }}
                  className="w-full bg-red-900 hover:bg-red-800 text-white p-4 rounded-lg font-bold border border-red-600 shadow-lg"
                >
                  🌕 {t('actions.processNight')}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    if (!confirm(t('tips.confirmProcessDay'))) return;
                    try {
                      const res = await fetch(`/api/rooms/${roomCode}/process-day`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      const result = await res.json();
                      if (!res.ok) {
                        const errorMsg = result.error 
                          ? translateError(result.error, result.errorParams, myPlayerId) 
                          : t('tips.processDayFailed');
                        throw new Error(errorMsg);
                      }
                      
                      // 延迟一下再刷新，确保数据库已更新
                      setTimeout(() => {
                        fetchRoomState(roomCode);
                        fetchPlayers(roomCode);
                        fetchLogs(roomCode);
                      }, 500);
                    } catch (err: any) {
                      alert(err.message || t('tips.processDayFailed'));
                    }
                  }}
                  className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-red-100 p-4 rounded-lg font-bold border border-red-600 shadow-xl"
                >
                  ⚖️ {t('actions.processDay')}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-red-900 text-white px-6 py-3 rounded-full shadow-2xl border border-red-500 z-50 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* 房主作弊按钮 - 左下角 */}
          {isHost && myPlayer && (
            <>
              <button
                onClick={() => setShowRoleSelector(true)}
                className="fixed bottom-6 left-6 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg border border-purple-500 z-40 flex items-center gap-2 text-sm font-bold"
                title={t('gameUI.testingMode')}
              >
                🎭 {t('gameUI.selectRole')}
              </button>
              <RoleSelector
                isOpen={showRoleSelector}
                onClose={() => setShowRoleSelector(false)}
                currentRole={myPlayer.role}
                playerId={myPlayer.id}
                roomCode={roomCode}
                onRoleChange={() => {
                  fetchPlayers(roomCode);
                }}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // 显示大厅
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
        {/* 语言切换器 - 右上角，最高优先级，始终可见 */}
        <div className="fixed top-4 right-4 z-[9999]">
          <LanguageSwitcher playerId={myPlayerId} />
        </div>
      
      <GameRules />
      <div className="w-full max-w-md text-center bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-yellow-500">{t('lobby.waitingLobby')}</h1>

        <div className="bg-gray-900 p-6 rounded-lg mb-6 border border-gray-600">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">{t('lobby.roomCode')}</p>
          <p className="text-6xl font-mono font-bold text-blue-400 tracking-wider">{roomCode}</p>
        </div>

        <div className="mb-8">
          <p className="text-left text-gray-400 text-sm mb-3">
            {t('lobby.joinedPlayers')} {t('lobby.playersCount', { count: players.length })}
            {players.length === 0 && (
              <span className="text-yellow-500 ml-2 animate-pulse">{t('lobby.loading')}</span>
            )}
          </p>
          {players.length === 0 ? (
            <div className="bg-gray-700 p-4 rounded text-center text-gray-400 border border-gray-600">
              {t('lobby.waitingForPlayers')}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-700 p-3 rounded flex items-center gap-2 border border-gray-600"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.is_alive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
                  <span className="font-medium truncate">
                    {p.name} {p.is_host && '👑'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {myPlayer && (
          <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-600">
            <p className="text-gray-400 text-sm mb-2">{t('lobby.yourInfo')}</p>
            <p className="text-lg font-bold">{myPlayer.name}</p>
            {myPlayer.is_host && (
              <p className="text-yellow-400 text-sm mt-1">{t('lobby.host')}</p>
            )}
          </div>
        )}

        {isHost ? (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              {players.length < 4
                ? t('lobby.waitingMore', { count: players.length })
                : t('lobby.canStart', { count: players.length })}
            </p>
            <button
              onClick={() => setShowBoardSelector(true)}
              disabled={players.length < 4 || loading}
              className={`w-full p-4 rounded-lg font-bold shadow-lg transition ${
                players.length < 4
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {players.length < 4 ? t('lobby.waitingMore', { count: players.length }) : `🔥 ${t('actions.startGame')}`}
            </button>
          </div>
        ) : (
          <p className="text-gray-500 animate-pulse">{t('tips.waitForActions')}</p>
        )}

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-900 text-red-400 p-3 rounded text-center text-sm">
            {error}
          </div>
        )}
      </div>

          {/* 简易说明书（选择板子前） */}
          {showManual && !selectedBoardForManual && (
            <GameManual
              onClose={() => {
                setShowManual(false);
                setShowBoardSelector(true);
              }}
              playerId={myPlayerId}
            />
          )}

          {/* 板子选择器 */}
          {showBoardSelector && !selectedBoardForManual && (
            <BoardSelector
              onSelect={(boardType: BoardType) => {
                // 先显示该板子的详细说明
                setSelectedBoardForManual(boardType);
                setShowBoardSelector(false);
              }}
              onCancel={() => setShowBoardSelector(false)}
              loading={startingGame}
              playerId={myPlayerId}
            />
          )}

          {/* 板子详细说明（选择板子后） */}
          {selectedBoardForManual && (
            <GameManual
              onClose={async () => {
                // 关闭说明书，开始游戏
                setStartingGame(true);
                try {
                  const res = await fetch(`/api/rooms/${roomCode}/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ boardType: selectedBoardForManual as any })
                  });

                  const result = await res.json();

                  if (!res.ok) {
                    const errorMsg = result.error 
                      ? translateError(result.error, result.errorParams, myPlayerId) 
                      : t('error.gameStartFailed');
                    throw new Error(errorMsg);
                  }

                  // 刷新数据
                  fetchRoomState(roomCode);
                  fetchPlayers(roomCode);
                  fetchLogs(roomCode);
                  
                  // 重置状态
                  setSelectedBoardForManual(null);
                  setShowBoardSelector(false);
                } catch (err: any) {
                  setError(err.message || t('error.gameStartFailed'));
                } finally {
                  setStartingGame(false);
                }
              }}
              boardType={selectedBoardForManual as any}
              playerId={myPlayerId}
            />
          )}

          {/* 房主作弊按钮 - 左下角 */}
          {isHost && myPlayer && (
            <>
              <button
                onClick={() => setShowRoleSelector(true)}
                className="fixed bottom-6 left-6 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg border border-purple-500 z-40 flex items-center gap-2 text-sm font-bold"
                title="测试模式：选择角色"
              >
                🎭 选择角色
              </button>
              <RoleSelector
                isOpen={showRoleSelector}
                onClose={() => setShowRoleSelector(false)}
                currentRole={myPlayer.role}
                playerId={myPlayer.id}
                roomCode={roomCode}
                onRoleChange={() => {
                  fetchPlayers(roomCode);
                }}
              />
            </>
          )}
    </div>
  );
}
