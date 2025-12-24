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

  // Role related (placeholder, will be completed in update 3)
  role: {
    // Will be added in update 3
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
    selectRole: 'Select Role'
  }
};

