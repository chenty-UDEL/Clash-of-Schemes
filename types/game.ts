// ==========================================
// 权谋决战完整版 - 游戏类型定义
// ==========================================

import type { RoleName, BoardType } from '@/lib/game/roles';

// ==========================================
// 1. 游戏状态类型
// ==========================================

export type GamePhase = 'LOBBY' | 'NIGHT' | 'DAY' | 'GAME OVER';

export interface RoomState {
  code: string;
  round_state: GamePhase | string; // 'LOBBY' | 'NIGHT 1' | 'DAY 1' | 'GAME OVER'
  board_type?: 'fate' | 'balance' | 'strategy' | 'custom';
  deadlock_count?: number;
  last_state_hash?: string;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// 2. 玩家类型
// ==========================================

export interface Player {
  id: number;
  room_code: string;
  name: string;
  role: RoleName | null;
  is_alive: boolean;
  is_host: boolean;
  death_round: number | null;
  death_type: 'VOTE' | 'SKILL' | null;
  
  // 扩展字段（完整版）
  stored_votes?: number; // 投票回收者
  vote_predictions?: any; // 心灵胜者
  fate_target_id?: number; // 命运转移者
  copied_role?: RoleName; // 命运复制者
  copied_from_id?: number; // 命运复制者
  reverse_vote_used?: boolean; // 反向投票者
  balance_guard_used?: boolean; // 均衡守护者
  
  // 通用标记字段
  flags?: {
    ally_id?: number; // 同盟者
    shadow_target_id?: number; // 影子胜者
    is_protected?: boolean; // 利他守护者
    is_silenced?: boolean; // 沉默制裁者
    cannot_vote?: boolean; // 投票阻断者
    tie_streak?: number; // 平票终结者
    no_vote_streak?: number; // 免票胜者
    balance_streak?: number; // 票数平衡者
    last_vote_count?: number; // 票数平衡者
    multikill_streak?: number; // 多选胜者
    vote_history?: number[]; // 多选胜者
    [key: string]: any;
  };
  
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// 3. 投票类型
// ==========================================

export interface Vote {
  id?: number;
  room_code: string;
  voter_id: number;
  target_id: number | null; // null 代表弃票
  round_number: number;
  created_at?: string;
}

// ==========================================
// 4. 夜晚行动类型
// ==========================================

export type ActionType = 
  | 'check'           // 技能观测者
  | 'protect'         // 利他守护者
  | 'silence'         // 沉默制裁者
  | 'block_vote'      // 投票阻断者
  | 'ally_bind'       // 同盟者
  | 'shadow_bind'     // 影子胜者
  | 'copy_fate'       // 命运复制者
  | 'fate_transfer'   // 命运转移者
  | 'victory_steal'   // 胜利夺取者
  | 'predict_vote'    // 心灵胜者
  | 'store_vote'      // 投票回收者
  | 'reverse_vote'     // 反向投票者
  | 'break_tie';      // 均衡守护者

export interface NightAction {
  id?: number;
  room_code: string;
  actor_id: number;
  target_id: number | null;
  action_type: ActionType;
  round_number: number;
  created_at?: string;
}

// ==========================================
// 5. 游戏日志类型
// ==========================================

export type LogTag = 'PUBLIC' | 'PRIVATE';

export interface GameLog {
  id: number;
  room_code: string;
  message: string;
  viewer_ids: number[] | null; // null 表示所有人可见
  tag: LogTag;
  created_at: string;
}

// ==========================================
// 6. 游戏状态历史（死局检测）
// ==========================================

export interface GameState {
  id?: number;
  room_code: string;
  round_number: number;
  state_hash: string;
  created_at?: string;
}

// ==========================================
// 7. 投票预测（心灵胜者）
// ==========================================

export interface VotePrediction {
  id?: number;
  room_code: string;
  predictor_id: number;
  predicted_player_id: number;
  predicted_target_id: number | null;
  round_number: number;
  is_correct: boolean | null;
  created_at?: string;
}

// ==========================================
// 8. API 响应类型
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// 9. 游戏配置
// ==========================================

export interface GameConfig {
  minPlayers: number;
  maxPlayers: number;
  deadlockThreshold: number; // 死局判定阈值（连续相同次数）
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  minPlayers: 4,
  maxPlayers: 12,
  deadlockThreshold: 3
};

