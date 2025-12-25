// ==========================================
// 权谋决战完整版 - 统一角色配置系统
// ==========================================
// 版本: 2.0.0
// 说明: 所有22个角色的配置，前后端共享

// ==========================================
// 1. 所有角色列表（22个）
// ==========================================
export const ALL_ROLES = [
  // 当前15个角色
  '技能观测者', 
  '利他守护者', 
  '投票阻断者', 
  '沉默制裁者', 
  '同盟者',
  '减票守护者', 
  '双票使者', 
  '平票终结者', 
  '影子胜者', 
  '集票胜者',
  '三人王者', 
  '免票胜者', 
  '平票赢家', 
  '票数平衡者', 
  '多选胜者',
  // 新增7个角色
  '反向投票者', 
  '均衡守护者', 
  '命运复制者', 
  '心灵胜者', 
  '命运转移者', 
  '投票回收者', 
  '胜利夺取者'
] as const;

export type RoleName = typeof ALL_ROLES[number];

// ==========================================
// 2. 角色配置（类型、标签、描述）
// ==========================================
export interface RoleConfig {
  type: 'active' | 'passive' | 'situation' | 'counter' | 'special';
  tag: string;
  desc: string;
  nightOnly?: boolean; // 是否仅在夜晚使用
  onceOnly?: boolean; // 是否只能使用一次
}

export const ROLE_CONFIG: Record<RoleName, RoleConfig> = {
  // --- 主动与控制 ---
  '技能观测者': { 
    type: 'active', 
    tag: '查验', 
    desc: '每天夜晚指定一名玩家，查看其技能。' 
  },
  '利他守护者': { 
    type: 'active', 
    tag: '守护', 
    desc: '每天夜晚选择一名除你以外的玩家，使他第二天白天被投票数为0。' 
  },
  '投票阻断者': { 
    type: 'active', 
    tag: '控制', 
    desc: '指定一名玩家，使其本轮投票无效。' 
  },
  '沉默制裁者': { 
    type: 'active', 
    tag: '控制', 
    desc: '指定一名玩家，使其本轮无法发言。' 
  },
  '同盟者': { 
    type: 'active', 
    tag: '绑定', 
    desc: '你与指定玩家相互投票无效，若共同投票同一人，+1票（只能在第一个夜晚发动，之后生效至游戏结束）。',
    nightOnly: true
  },
  
  // --- 被动与防御 ---
  '减票守护者': { 
    type: 'passive', 
    tag: '防御', 
    desc: '你被投票时，总得票数减少1票。' 
  },
  '双票使者': { 
    type: 'passive', 
    tag: '攻击', 
    desc: '你的每次投票计为两票。' 
  },
  
  // --- 局面型胜利 ---
  '三人王者': { 
    type: 'situation', 
    tag: '生存', 
    desc: '当场上仅剩 3 名玩家时，你立即获胜。' 
  },
  '集票胜者': { 
    type: 'situation', 
    tag: '爆发', 
    desc: '你被在场的2/3（向上取整）的人投票时，立即获胜。' 
  },
  '平票赢家': { 
    type: 'situation', 
    tag: '博弈', 
    desc: '当你与其他玩家平票时，你立即获胜。' 
  },
  '影子胜者': { 
    type: 'situation', 
    tag: '预判', 
    desc: '你被投出局的前后一回合内，指定玩家出局，你获胜（只能在第一个夜晚发动，之后生效至游戏结束）。',
    nightOnly: true
  },
  
  // --- 计数型胜利 ---
  '平票终结者': { 
    type: 'counter', 
    tag: '僵局', 
    desc: '连续a局（a为总人数的1/3，向上取整）平票，你获胜。' 
  },
  '免票胜者': { 
    type: 'counter', 
    tag: '潜伏', 
    desc: '连续a局未被投票（a为总人数的1/3，向上取整），你获胜。' 
  },
  '票数平衡者': { 
    type: 'counter', 
    tag: '控票', 
    desc: '如果在连续a局投票中，你的得票数恰好是相同的（无论多寡），你立即获胜。（a为总人数的1/2，向上取整）' 
  },
  '多选胜者': { 
    type: 'counter', 
    tag: '连杀', 
    desc: '当你在游戏过程中连续a轮给不同的玩家投票，且这些玩家都在接下来的a轮中被淘汰，你立即获胜。（a为总人数的1/3，向上取整）' 
  },
  
  // --- 新增角色 ---
  '反向投票者': { 
    type: 'special', 
    tag: '反击', 
    desc: '当你被投票出局时，选择一名投你的人代替你出局，技能只能使用一次。',
    onceOnly: true
  },
  '均衡守护者': { 
    type: 'special', 
    tag: '破局', 
    desc: '当出现平票时，你可以打破平局，技能只能使用一次。',
    onceOnly: true
  },
  '命运复制者': { 
    type: 'special', 
    tag: '复制', 
    desc: '第一天晚上选择一个角色，拥有该角色的技能，但如果选的玩家死亡了自己也跟着死亡。',
    nightOnly: true
  },
  '心灵胜者': { 
    type: 'counter', 
    tag: '预测', 
    desc: '你可以每晚预测一名其他玩家的投票，如果连续a次预测成功，你立即获胜（a为总人数的1/2，向上取整）。' 
  },
  '命运转移者': { 
    type: 'active', 
    tag: '转移', 
    desc: '在每个夜晚，你可以选择将自己与另一名玩家的命运调换。如果该玩家在接下来的白天被淘汰，你将代替他出局，反之亦然。' 
  },
  '投票回收者': { 
    type: 'special', 
    tag: '存储', 
    desc: '你可以在每个白天保留一张未使用的投票，最多保留3张。在任何一轮投票时，你可以同时使用所有存储的投票。' 
  },
  '胜利夺取者': { 
    type: 'special', 
    tag: '夺取', 
    desc: '你可以在夜晚选择一名玩家并夺取其特殊胜利条件，如果该玩家本轮获胜，则改为你立即获胜，否则你死亡，你可以普通获胜。' 
  },
};

// ==========================================
// 3. 板子配置（3个预设板子）
// ==========================================
export type BoardType = 'fate' | 'balance' | 'strategy' | 'custom';

export const BOARDS: Record<BoardType, RoleName[]> = {
  // 板子1：命运之轮
  fate: [
    '命运复制者', 
    '心灵胜者', 
    '命运转移者', 
    '多选胜者', 
    '胜利夺取者',
    '投票回收者', 
    '票数平衡者', 
    '影子胜者', 
    '平票终结者', 
    '同盟者',
    '沉默制裁者', 
    '投票阻断者', 
    '反向投票者'
  ],
  
  // 板子2：均衡法则
  balance: [
    '票数平衡者', 
    '平票赢家', 
    '平票终结者', 
    '均衡守护者', 
    '利他守护者',
    '免票胜者', 
    '集票胜者', 
    '影子胜者', 
    '多选胜者', 
    '三人王者',
    '反向投票者', 
    '同盟者', 
    '投票阻断者'
  ],
  
  // 板子3：策略之巅
  strategy: [
    '投票回收者', 
    '多选胜者', 
    '心灵胜者', 
    '三人王者', 
    '平票终结者',
    '利他守护者', 
    '投票阻断者', 
    '影子胜者', 
    '胜利夺取者', 
    '反向投票者',
    '均衡守护者', 
    '命运复制者', 
    '平票赢家'
  ],
  
  // 自定义板子（空数组，由用户选择）
  custom: []
};

// ==========================================
// 4. 行动顺序配置
// ==========================================

// 夜晚行动顺序
export const NIGHT_ACTION_ORDER: RoleName[] = [
  '命运复制者',
  '技能观测者',
  '命运转移者',
  '利他守护者',
  '投票阻断者',
  '沉默制裁者',
  '同盟者',
  '影子胜者'
];

// 白天行动顺序
export const DAY_ACTION_ORDER: RoleName[] = [
  '利他守护者',
  '沉默制裁者',
  '双票使者',
  '投票阻断者',
  '影子胜者',
  '均衡守护者',
  '平票终结者'
];

// ==========================================
// 5. 工具函数
// ==========================================

/**
 * 根据板子类型获取角色列表
 */
export function getRolesByBoard(boardType: BoardType): RoleName[] {
  return BOARDS[boardType];
}

/**
 * 检查角色是否在指定板子中
 */
export function isRoleInBoard(role: RoleName, boardType: BoardType): boolean {
  return BOARDS[boardType].includes(role);
}

/**
 * 获取角色的配置
 */
export function getRoleConfig(role: RoleName): RoleConfig {
  return ROLE_CONFIG[role];
}

/**
 * 获取所有主动技能角色
 */
export function getActiveRoles(): RoleName[] {
  return ALL_ROLES.filter(role => ROLE_CONFIG[role].type === 'active');
}

/**
 * 获取所有特殊胜利角色
 */
export function getVictoryRoles(): RoleName[] {
  return ALL_ROLES.filter(role => 
    ROLE_CONFIG[role].type === 'situation' || 
    ROLE_CONFIG[role].type === 'counter'
  );
}


