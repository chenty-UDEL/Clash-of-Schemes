'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Player, RoomState, GameLog } from '@/types/game';

export default function Home() {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 获取我的玩家信息
  const getMyPlayer = () => players.find(p => p.name === name);
  const isHost = getMyPlayer()?.is_host;

  // 获取数据
  const fetchPlayers = async (code: string) => {
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('room_code', code)
      .order('id');
    if (data) setPlayers(data as Player[]);
  };

  const fetchRoomState = async (code: string) => {
    const { data } = await supabase
      .from('rooms')
      .select('code, round_state, board_type')
      .eq('code', code)
      .single();
    if (data) setRoomState(data as RoomState);
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

    const channel1 = supabase
      .channel('room')
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
      .channel('players')
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
      .channel('logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_logs',
        filter: `room_code=eq.${roomCode}`
      }, () => {
        fetchLogs(roomCode);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
      supabase.removeChannel(channel3);
    };
  }, [isInRoom, roomCode]);

  // 创建房间
  const handleCreateRoom = async () => {
    if (!name) {
      setError('请输入名字');
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
        throw new Error(result.error || '创建房间失败');
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
      setError('请输入名字和房间号');
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
        throw new Error(result.error || '加入房间失败');
      }

      setIsInRoom(true);
      fetchPlayers(roomCode);
      fetchRoomState(roomCode);
      fetchLogs(roomCode);
    } catch (err: any) {
      setError(err.message || '加入房间失败');
    } finally {
      setLoading(false);
    }
  };

  // 未加入房间 - 显示登录界面
  if (!isInRoom) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
            权谋决战完整版
          </h1>
          <p className="text-gray-400">22角色社交推理游戏</p>
        </div>

        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 border border-gray-800">
          <div>
            <label className="text-xs text-gray-400 ml-1 mb-1 block">昵称</label>
            <input
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none text-white"
              placeholder="输入你的名字"
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
              {loading ? '创建中...' : '创建房间'}
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">或</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          <div className="flex gap-3">
            <input
              className="flex-1 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-green-500 outline-none text-white"
              placeholder="输入房间号"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className="w-24 bg-green-700 hover:bg-green-600 p-4 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '加入中...' : '加入'}
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

  // 已加入房间 - 显示大厅
  const alivePlayers = players.filter(p => p.is_alive);
  const myPlayer = getMyPlayer();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-yellow-500">等待大厅</h1>

        <div className="bg-gray-900 p-6 rounded-lg mb-6 border border-gray-600">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Room Code</p>
          <p className="text-6xl font-mono font-bold text-blue-400 tracking-wider">{roomCode}</p>
        </div>

        <div className="mb-8">
          <p className="text-left text-gray-400 text-sm mb-3">
            已加入玩家 ({players.length}/12)
          </p>
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
        </div>

        {myPlayer && (
          <div className="bg-gray-900 p-4 rounded-lg mb-6 border border-gray-600">
            <p className="text-gray-400 text-sm mb-2">你的信息</p>
            <p className="text-lg font-bold">{myPlayer.name}</p>
            {myPlayer.is_host && (
              <p className="text-yellow-400 text-sm mt-1">👑 房主</p>
            )}
          </div>
        )}

        {isHost ? (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              {players.length < 4
                ? `等待更多玩家加入 (${players.length}/4)`
                : `可以开始游戏 (${players.length}/12)`}
            </p>
            <button
              disabled={players.length < 4 || loading}
              className={`w-full p-4 rounded-lg font-bold shadow-lg transition ${
                players.length < 4
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {players.length < 4 ? '等待玩家' : '🔥 开始游戏'}
            </button>
          </div>
        ) : (
          <p className="text-gray-500 animate-pulse">等待房主开始游戏...</p>
        )}

        {error && (
          <div className="mt-4 bg-red-900/30 border border-red-900 text-red-400 p-3 rounded text-center text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
