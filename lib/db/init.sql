-- ==========================================
-- 权谋决战完整版 - 数据库初始化脚本
-- ==========================================
-- 版本: 2.0.0
-- 说明: 完整的数据库初始化，包括表创建和 RLS 策略
-- 使用方法: 在 Supabase SQL Editor 中一次性执行此文件

-- ==========================================
-- 第一部分：创建表结构
-- ==========================================

-- 1. 房间表 (rooms)
CREATE TABLE IF NOT EXISTS rooms (
    code VARCHAR(10) PRIMARY KEY,
    round_state VARCHAR(20) DEFAULT 'LOBBY',
    board_type VARCHAR(20) DEFAULT 'custom', -- 'fate', 'balance', 'strategy', 'custom'
    deadlock_count INTEGER DEFAULT 0,
    last_state_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 玩家表 (players)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    role VARCHAR(50),
    is_alive BOOLEAN DEFAULT true,
    is_host BOOLEAN DEFAULT false,
    death_round INTEGER,
    death_type VARCHAR(20), -- 'VOTE', 'SKILL', etc.
    
    -- 扩展字段（完整版新增）
    stored_votes INTEGER DEFAULT 0, -- 投票回收者存储的票数
    vote_predictions JSONB, -- 心灵胜者的预测记录
    fate_target_id INTEGER, -- 命运转移者的目标玩家ID
    copied_role VARCHAR(50), -- 命运复制者复制的角色
    copied_from_id INTEGER, -- 命运复制者复制的来源玩家ID
    reverse_vote_used BOOLEAN DEFAULT false, -- 反向投票者是否已使用
    balance_guard_used BOOLEAN DEFAULT false, -- 均衡守护者是否已使用
    
    -- 通用标记字段（JSON格式，存储各种状态）
    flags JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 投票表 (votes)
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    voter_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    target_id INTEGER REFERENCES players(id) ON DELETE SET NULL, -- NULL 代表弃票
    round_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(room_code, voter_id, round_number)
);

-- 4. 夜晚行动表 (night_actions)
CREATE TABLE IF NOT EXISTS night_actions (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    target_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'check', 'protect', 'silence', 'block_vote', 'ally_bind', 'shadow_bind', 'copy_fate', 'fate_transfer', 'victory_steal', 'predict_vote'
    round_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 游戏日志表 (game_logs)
CREATE TABLE IF NOT EXISTS game_logs (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    message TEXT NOT NULL,
    viewer_ids INTEGER[], -- NULL 表示所有人可见，数组表示只有指定玩家可见
    tag VARCHAR(20) DEFAULT 'PUBLIC', -- 'PUBLIC', 'PRIVATE'
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. 游戏状态历史表 (game_states) - 用于死局检测
CREATE TABLE IF NOT EXISTS game_states (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    state_hash TEXT NOT NULL, -- 技能+投票的哈希值
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. 投票预测记录表 (vote_predictions) - 用于心灵胜者
CREATE TABLE IF NOT EXISTS vote_predictions (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    predictor_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    predicted_player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    predicted_target_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    round_number INTEGER NOT NULL,
    is_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 第二部分：创建索引
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_players_alive ON players(room_code, is_alive);
CREATE INDEX IF NOT EXISTS idx_votes_room_round ON votes(room_code, round_number);
CREATE INDEX IF NOT EXISTS idx_night_actions_room_round ON night_actions(room_code, round_number);
CREATE INDEX IF NOT EXISTS idx_game_logs_room ON game_logs(room_code);
CREATE INDEX IF NOT EXISTS idx_game_states_room ON game_states(room_code, round_number);
CREATE INDEX IF NOT EXISTS idx_vote_predictions_room ON vote_predictions(room_code, predictor_id, round_number);

-- ==========================================
-- 第三部分：创建触发器
-- ==========================================

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 rooms 表创建触发器
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为 players 表创建触发器
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 第四部分：配置 Row Level Security (RLS)
-- ==========================================

-- 启用 RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE night_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_predictions ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略（如果重新执行）
DROP POLICY IF EXISTS "Anyone can read rooms" ON rooms;
DROP POLICY IF EXISTS "Service role can manage rooms" ON rooms;
DROP POLICY IF EXISTS "Anyone can read players in same room" ON players;
DROP POLICY IF EXISTS "Service role can manage players" ON players;
DROP POLICY IF EXISTS "Anyone can read votes in same room" ON votes;
DROP POLICY IF EXISTS "Service role can manage votes" ON votes;
DROP POLICY IF EXISTS "Anyone can read night actions in same room" ON night_actions;
DROP POLICY IF EXISTS "Service role can manage night actions" ON night_actions;
DROP POLICY IF EXISTS "Anyone can read game logs in same room" ON game_logs;
DROP POLICY IF EXISTS "Service role can create game logs" ON game_logs;
DROP POLICY IF EXISTS "Service role can manage game states" ON game_states;
DROP POLICY IF EXISTS "Service role can manage vote predictions" ON vote_predictions;

-- 房间表策略
CREATE POLICY "Anyone can read rooms"
    ON rooms FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage rooms"
    ON rooms FOR ALL
    USING (auth.role() = 'service_role');

-- 玩家表策略
CREATE POLICY "Anyone can read players in same room"
    ON players FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage players"
    ON players FOR ALL
    USING (auth.role() = 'service_role');

-- 投票表策略
CREATE POLICY "Anyone can read votes in same room"
    ON votes FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage votes"
    ON votes FOR ALL
    USING (auth.role() = 'service_role');

-- 夜晚行动表策略
CREATE POLICY "Anyone can read night actions in same room"
    ON night_actions FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage night actions"
    ON night_actions FOR ALL
    USING (auth.role() = 'service_role');

-- 游戏日志表策略
CREATE POLICY "Anyone can read game logs in same room"
    ON game_logs FOR SELECT
    USING (true);

CREATE POLICY "Service role can create game logs"
    ON game_logs FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- 游戏状态表策略
CREATE POLICY "Service role can manage game states"
    ON game_states FOR ALL
    USING (auth.role() = 'service_role');

-- 投票预测表策略
CREATE POLICY "Service role can manage vote predictions"
    ON vote_predictions FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- 初始化完成！
-- ==========================================
-- 所有表、索引、触发器和 RLS 策略已创建
-- 可以开始使用数据库了

