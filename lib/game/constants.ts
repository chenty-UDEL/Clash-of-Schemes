// ==========================================
// 权谋决战完整版 - 游戏常量
// ==========================================

import { DEFAULT_GAME_CONFIG } from '@/types/game';

// ==========================================
// 1. 游戏配置常量
// ==========================================

export const MIN_PLAYERS = 4; // 最小4人
export const MAX_PLAYERS = 12; // 最大12人
export const DEADLOCK_THRESHOLD = DEFAULT_GAME_CONFIG.deadlockThreshold; // 3

// ==========================================
// 2. 回合计算函数
// ==========================================

/**
 * 计算平票终结者需要的连续平票次数
 */
export function getTieBreakerThreshold(totalPlayers: number): number {
  return Math.ceil(totalPlayers / 3);
}

/**
 * 计算免票胜者需要的连续零票次数
 */
export function getNoVoteThreshold(totalPlayers: number): number {
  return Math.ceil(totalPlayers / 3);
}

/**
 * 计算票数平衡者需要的连续相同票数次数
 */
export function getBalanceThreshold(totalPlayers: number): number {
  return Math.ceil(totalPlayers / 2);
}

/**
 * 计算多选胜者需要的连续投死不同人次数
 */
export function getMultiKillThreshold(totalPlayers: number): number {
  return Math.ceil(totalPlayers / 3);
}

/**
 * 计算心灵胜者需要的连续预测成功次数
 */
export function getMindReaderThreshold(totalPlayers: number): number {
  return Math.ceil(totalPlayers / 2);
}

/**
 * 计算集票胜者需要的票数（2/3向上取整）
 */
export function getCollectorThreshold(aliveCount: number): number {
  return Math.ceil(aliveCount * 2 / 3);
}

// ==========================================
// 3. 游戏阶段常量
// ==========================================

export const GAME_PHASES = {
  LOBBY: 'LOBBY',
  NIGHT: 'NIGHT',
  DAY: 'DAY',
  GAME_OVER: 'GAME OVER'
} as const;

// ==========================================
// 4. 行动类型常量
// ==========================================

export const ACTION_TYPES = {
  CHECK: 'check',
  PROTECT: 'protect',
  SILENCE: 'silence',
  BLOCK_VOTE: 'block_vote',
  ALLY_BIND: 'ally_bind',
  SHADOW_BIND: 'shadow_bind',
  COPY_FATE: 'copy_fate',
  FATE_TRANSFER: 'fate_transfer',
  VICTORY_STEAL: 'victory_steal',
  PREDICT_VOTE: 'predict_vote',
  STORE_VOTE: 'store_vote',
  REVERSE_VOTE: 'reverse_vote',
  BREAK_TIE: 'break_tie'
} as const;

// ==========================================
// 5. 投票回收者配置
// ==========================================

export const MAX_STORED_VOTES = 3; // 投票回收者最多存储3张票

// ==========================================
// 6. 工具函数
// ==========================================

/**
 * 解析回合状态字符串，提取回合号
 */
export function parseRoundNumber(roundState: string): number {
  const match = roundState.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

/**
 * 判断是否为夜晚阶段
 */
export function isNightPhase(roundState: string): boolean {
  return roundState.startsWith('NIGHT');
}

/**
 * 判断是否为白天阶段
 */
export function isDayPhase(roundState: string): boolean {
  return roundState.startsWith('DAY');
}

/**
 * 判断是否为第一夜
 */
export function isFirstNight(roundState: string): boolean {
  return roundState === 'NIGHT 1';
}

