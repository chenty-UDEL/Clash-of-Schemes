// 中文翻译文件
export const zh = {
  // 通用
  common: {
    confirm: '确认',
    cancel: '取消',
    submit: '提交',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    join: '加入',
    start: '开始',
    end: '结束',
    yes: '是',
    no: '否'
  },

  // 游戏标题和描述
  game: {
    title: '权谋决战完整版',
    subtitle: '22角色社交推理游戏',
    roomCode: '房间号',
    nickname: '昵称',
    enterName: '输入你的名字',
    enterRoomCode: '输入房间号',
    createRoom: '创建房间',
    joinRoom: '加入',
    or: '或',
    waitingLobby: '等待大厅',
    gameOver: '游戏结束',
    nightPhase: '夜晚阶段',
    dayPhase: '白天阶段',
    lobby: '大厅'
  },

  // 玩家相关
  player: {
    host: '房主',
    alive: '存活',
    dead: '已出局',
    players: '玩家',
    joinedPlayers: '已加入玩家',
    yourInfo: '你的信息',
    waitingPlayers: '等待玩家加入...',
    minPlayers: '等待更多玩家加入',
    canStart: '可以开始游戏'
  },

  // 角色相关（占位，第3次更新时完善）
  role: {
    // 将在第3次更新时添加
  },

  // 游戏阶段
  phase: {
    night: '夜晚',
    day: '白天',
    voting: '投票',
    discussion: '讨论',
    action: '行动',
    waiting: '等待中',
    processing: '处理中',
    ended: '已结束'
  },

  // 按钮和操作
  actions: {
    submitAction: '提交行动',
    submitVote: '提交投票',
    processNight: '天亮了 (结算)',
    processDay: '公布结果 (处决)',
    startGame: '开始游戏',
    selectBoard: '选择板子',
    selectRole: '选择角色',
    storeVote: '存储投票',
    useStoredVotes: '使用存储的票',
    breakTie: '打破平局',
    confirm: '确认',
    cancel: '取消'
  },

  // 错误消息（占位，第4次更新时完善）
  error: {
    // 将在第4次更新时添加
  },

  // 成功消息
  success: {
    actionSubmitted: '行动已提交',
    voteSubmitted: '投票已提交',
    roleUpdated: '角色已更新',
    gameStarted: '游戏已开始'
  },

  // 提示和说明
  tips: {
    hostControl: '房主控制面板 (上帝视角)',
    waitForActions: '等待所有玩家行动后再结算',
    noAction: '今晚无主动技能，请等待天亮。',
    firstNightOnly: '技能只能在第一夜发动。',
    selectTarget: '请先选择目标',
    selectRole: '请选择一个角色',
    nightPhaseDesc: '有技能的玩家可以发动技能，房主可以结算夜晚',
    dayPhaseDesc: '所有玩家进行投票，房主可以结算白天',
    noCopiedRole: '你尚未复制角色，无法使用技能。',
    skillSubmitted: '技能已提交',
    voteSubmitted: '投票已提交',
    confirmProcessNight: '确定要结束夜晚并进行结算吗？',
    confirmProcessDay: '确定要结束投票并公布结果吗？'
  },

  // 大厅相关
  lobby: {
    waitingLobby: '等待大厅',
    roomCode: 'Room Code',
    joinedPlayers: '已加入玩家',
    playersCount: '({count}/12)',
    loading: '加载中...',
    waitingForPlayers: '等待玩家加入...',
    yourInfo: '你的信息',
    host: '👑 房主',
    waitingMore: '等待更多玩家加入 ({count}/4)',
    canStart: '可以开始游戏 ({count}/12)',
    viewRules: '查看规则',
    selectBoard: '选择板子'
  },

  // 游戏界面
  gameUI: {
    roundState: '公告',
    nightPhase: '🌙 夜晚阶段',
    dayPhase: '☀️ 白天阶段',
    lobby: '🏠 大厅',
    skillActivation: '技能发动',
    vote: '🗳️ 选择一名玩家进行投票，得票最多者将被处决。平票则无人出局。',
    selectTarget: '选择目标',
    submit: '提交',
    submitted: '已提交',
    processing: '处理中...',
    selectPlayer: '选择玩家',
    noTarget: '无目标',
    abandon: '弃票',
    noMessages: '暂无消息...',
    private: '[私密]',
    storeVote: '存储投票',
    storedVotes: '存储的票数',
    useStoredVotes: '同时使用所有存储的票',
    maxStored: '最多只能存储 {max} 张票',
    useStored: '使用 {count} 张存储的票',
    confirmVote: '确认投票 (使用 {count} 张票)',
    tieBreaker: '打破平局',
    selectCandidate: '选择要处决的玩家',
    breakTie: '打破平局',
    testingMode: '测试模式：选择角色',
    selectRole: '选择角色'
  }
};

