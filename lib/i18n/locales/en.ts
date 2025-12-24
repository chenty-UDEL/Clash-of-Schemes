// English translation file
export const en = {
  // Common
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    join: 'Join',
    start: 'Start',
    end: 'End',
    yes: 'Yes',
    no: 'No'
  },

  // Game title and description
  game: {
    title: 'Clash of Schemes Full Version',
    subtitle: '22-Role Social Deduction Game',
    roomCode: 'Room Code',
    nickname: 'Nickname',
    enterName: 'Enter your name',
    enterRoomCode: 'Enter room code',
    createRoom: 'Create Room',
    joinRoom: 'Join',
    or: 'or',
    waitingLobby: 'Waiting Lobby',
    gameOver: 'Game Over',
    nightPhase: 'Night Phase',
    dayPhase: 'Day Phase',
    lobby: 'Lobby'
  },

  // Player related
  player: {
    host: 'Host',
    alive: 'Alive',
    dead: 'Dead',
    players: 'Players',
    joinedPlayers: 'Joined Players',
    yourInfo: 'Your Info',
    waitingPlayers: 'Waiting for players...',
    minPlayers: 'Waiting for more players',
    canStart: 'Can start game'
  },

  // Role related
  role: {
    // Role names
    names: {
      '技能观测者': 'Skill Observer',
      '利他守护者': 'Altruistic Guardian',
      '投票阻断者': 'Vote Blocker',
      '沉默制裁者': 'Silence Enforcer',
      '同盟者': 'Ally',
      '减票守护者': 'Vote Reducer',
      '双票使者': 'Double Voter',
      '平票终结者': 'Tie Breaker',
      '影子胜者': 'Shadow Winner',
      '集票胜者': 'Vote Collector Winner',
      '三人王者': 'Three King',
      '免票胜者': 'Vote-Free Winner',
      '平票赢家': 'Tie Winner',
      '票数平衡者': 'Vote Balancer',
      '多选胜者': 'Multi-Target Winner',
      '反向投票者': 'Reverse Voter',
      '均衡守护者': 'Balance Guardian',
      '命运复制者': 'Fate Copier',
      '心灵胜者': 'Mind Reader',
      '命运转移者': 'Fate Transferer',
      '投票回收者': 'Vote Collector',
      '胜利夺取者': 'Victory Stealer'
    },
    // Role tags
    tags: {
      '技能观测者': 'Check',
      '利他守护者': 'Protect',
      '投票阻断者': 'Control',
      '沉默制裁者': 'Control',
      '同盟者': 'Bind',
      '减票守护者': 'Defense',
      '双票使者': 'Attack',
      '平票终结者': 'Stalemate',
      '影子胜者': 'Predict',
      '集票胜者': 'Burst',
      '三人王者': 'Survive',
      '免票胜者': 'Lurk',
      '平票赢家': 'Gamble',
      '票数平衡者': 'Control',
      '多选胜者': 'Chain Kill',
      '反向投票者': 'Counter',
      '均衡守护者': 'Break Tie',
      '命运复制者': 'Copy',
      '心灵胜者': 'Predict',
      '命运转移者': 'Transfer',
      '投票回收者': 'Store',
      '胜利夺取者': 'Steal'
    },
    // Role descriptions
    descriptions: {
      '技能观测者': 'Each night, designate a player to check their skill.',
      '利他守护者': 'Each night, choose a player other than yourself to make their votes count as 0 the next day.',
      '投票阻断者': 'Designate a player to make their vote invalid this round.',
      '沉默制裁者': 'Designate a player to make them unable to speak this round.',
      '同盟者': 'You and the designated player\'s votes against each other are invalid. If you vote for the same person, +1 vote (can only be used on the first night, then effective until game end).',
      '减票守护者': 'When you are voted, your total votes are reduced by 1.',
      '双票使者': 'Each of your votes counts as 2 votes.',
      '平票终结者': 'If there are a consecutive ties (a = total players / 3, rounded up), you win.',
      '影子胜者': 'Within one round before or after you are voted out, if the designated player is eliminated, you win (can only be used on the first night, then effective until game end).',
      '集票胜者': 'When you are voted by 2/3 (rounded up) of the players present, you immediately win.',
      '三人王者': 'When only 3 players remain, you immediately win.',
      '免票胜者': 'If you are not voted for a consecutive rounds (a = total players / 3, rounded up), you win.',
      '平票赢家': 'When you tie with other players, you immediately win.',
      '票数平衡者': 'If in consecutive a rounds of voting, your vote count is exactly the same (regardless of amount), you immediately win. (a = total players / 2, rounded up)',
      '多选胜者': 'If you vote for different players in consecutive a rounds, and all these players are eliminated in the following a rounds, you immediately win. (a = total players / 3, rounded up)',
      '反向投票者': 'When you are voted out, choose a player who voted for you to be eliminated instead. Can only be used once.',
      '均衡守护者': 'When there is a tie, you can break the tie. Can only be used once.',
      '命运复制者': 'On the first night, choose a role to copy its skills. If the chosen player dies, you die too.',
      '心灵胜者': 'Each night, you can predict another player\'s vote. If you predict correctly a consecutive times, you immediately win (a = total players / 2, rounded up).',
      '命运转移者': 'Each night, you can choose to swap fates with another player. If that player is eliminated the next day, you are eliminated instead, and vice versa.',
      '投票回收者': 'You can store one unused vote each day, up to 3. In any voting round, you can use all stored votes at once.',
      '胜利夺取者': 'At night, you can choose a player and steal their special victory condition. If that player wins this round, you win instead. Otherwise, you die. You can also win normally.'
    }
  },

  // Game phases
  phase: {
    night: 'Night',
    day: 'Day',
    voting: 'Voting',
    discussion: 'Discussion',
    action: 'Action',
    waiting: 'Waiting',
    processing: 'Processing',
    ended: 'Ended'
  },

  // Buttons and actions
  actions: {
    submitAction: 'Submit Action',
    submitVote: 'Submit Vote',
    processNight: 'Dawn (Process)',
    processDay: 'Announce Results (Execute)',
    startGame: 'Start Game',
    selectBoard: 'Select Board',
    selectRole: 'Select Role',
    storeVote: 'Store Vote',
    useStoredVotes: 'Use Stored Votes',
    breakTie: 'Break Tie',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },

  // Error messages (placeholder, will be completed in update 4)
  error: {
    // Will be added in update 4
  },

  // Success messages
  success: {
    actionSubmitted: 'Action submitted',
    voteSubmitted: 'Vote submitted',
    roleUpdated: 'Role updated',
    gameStarted: 'Game started'
  },

  // Tips and instructions
  tips: {
    hostControl: 'Host Control Panel (God View)',
    waitForActions: 'Wait for all players to act before processing',
    noAction: 'No active skill tonight, please wait for dawn.',
    firstNightOnly: 'Skill can only be used on the first night.',
    selectTarget: 'Please select a target first',
    selectRole: 'Please select a role',
    nightPhaseDesc: 'Players with skills can activate them, host can process night',
    dayPhaseDesc: 'All players vote, host can process day',
    noCopiedRole: 'You have not copied a role yet, cannot use skills.',
    skillSubmitted: 'Skill submitted',
    voteSubmitted: 'Vote submitted',
    confirmProcessNight: 'Are you sure you want to end the night and process?',
    confirmProcessDay: 'Are you sure you want to end voting and announce results?'
  },

  // Lobby related
  lobby: {
    waitingLobby: 'Waiting Lobby',
    roomCode: 'Room Code',
    joinedPlayers: 'Joined Players',
    playersCount: '({count}/12)',
    loading: 'Loading...',
    waitingForPlayers: 'Waiting for players...',
    yourInfo: 'Your Info',
    host: '👑 Host',
    waitingMore: 'Waiting for more players ({count}/4)',
    canStart: 'Can start game ({count}/12)',
    viewRules: 'View Rules',
    selectBoard: 'Select Board'
  },

  // Game UI
  gameUI: {
    roundState: 'Announcements',
    nightPhase: '🌙 Night Phase',
    dayPhase: '☀️ Day Phase',
    lobby: '🏠 Lobby',
    skillActivation: 'Skill Activation',
    vote: '🗳️ Select a player to vote. The player with the most votes will be executed. Tie means no elimination.',
    selectTarget: 'Select Target',
    submit: 'Submit',
    submitted: 'Submitted',
    processing: 'Processing...',
    selectPlayer: 'Select Player',
    noTarget: 'No Target',
    abandon: 'Abstain',
    noMessages: 'No messages...',
    private: '[PRIVATE]',
    storeVote: 'Store Vote',
    storedVotes: 'Stored Votes',
    useStoredVotes: 'Use All Stored Votes',
    maxStored: 'Can store up to {max} votes',
    useStored: 'Use {count} stored votes',
    confirmVote: 'Confirm Vote (using {count} votes)',
    tieBreaker: 'Break Tie',
    selectCandidate: 'Select Player to Execute',
    breakTie: 'Break Tie',
    testingMode: 'Testing Mode: Select Role',
    selectRole: 'Select Role',
    copiedRole: 'Copied Role',
    fromPlayer: 'from Player',
    waitingCopy: 'Waiting to copy role on first night...',
    fateTransferred: 'Fate Transferred',
    withPlayer: 'with Player',
    fateSwapped: 'fate swapped',
    targetLocked: 'Target Locked',
    specialVictory: 'special victory condition',
    skillUsed: 'Skill Used',
    currentRole: 'Current Role',
    unassigned: 'Unassigned',
    usingCopiedRole: 'Using Copied Role Skill'
  }
};

