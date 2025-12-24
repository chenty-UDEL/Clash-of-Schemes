-- ==========================================
-- 权谋决战完整版 - 数据库Schema
-- ==========================================
-- 版本: 2.0.0
-- 说明: 完整版数据库结构，支持22个角色、板子系统、行动顺序、死局判定

-- ==========================================
-- 1. 房间表 (rooms)
-- ==========================================
CREATE TABLE IF NOT EXISTS rooms (
    code VARCHAR(10) PRIMARY KEY,
    round_state VARCHAR(20) DEFAULT 'LOBBY',
    board_type VARCHAR(20) DEFAULT 'custom', -- 'fate', 'balance', 'strategy', 'custom'
    deadlock_count INTEGER DEFAULT 0,
    last_state_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 2. 玩家表 (players)
-- ==========================================
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

-- ==========================================
-- 3. 投票表 (votes)
-- ==========================================
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    voter_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    target_id INTEGER REFERENCES players(id) ON DELETE SET NULL, -- NULL 代表弃票
    round_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(room_code, voter_id, round_number)
);

-- ==========================================
-- 4. 夜晚行动表 (night_actions)
-- ==========================================
CREATE TABLE IF NOT EXISTS night_actions (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    target_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- 'check', 'protect', 'silence', 'block_vote', 'ally_bind', 'shadow_bind', 'copy_fate', 'fate_transfer', 'victory_steal', 'predict_vote'
    round_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 5. 游戏日志表 (game_logs)
-- ==========================================
CREATE TABLE IF NOT EXISTS game_logs (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    message TEXT NOT NULL,
    viewer_ids INTEGER[], -- NULL 表示所有人可见，数组表示只有指定玩家可见
    tag VARCHAR(20) DEFAULT 'PUBLIC', -- 'PUBLIC', 'PRIVATE'
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 6. 游戏状态历史表 (game_states) - 用于死局检测
-- ==========================================
CREATE TABLE IF NOT EXISTS game_states (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(10) NOT NULL REFERENCES rooms(code) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    state_hash TEXT NOT NULL, -- 技能+投票的哈希值
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- 7. 投票预测记录表 (vote_predictions) - 用于心灵胜者
-- ==========================================
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
-- 8. 索引优化
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_players_alive ON players(room_code, is_alive);
CREATE INDEX IF NOT EXISTS idx_votes_room_round ON votes(room_code, round_number);
CREATE INDEX IF NOT EXISTS idx_night_actions_room_round ON night_actions(room_code, round_number);
CREATE INDEX IF NOT EXISTS idx_game_logs_room ON game_logs(room_code);
CREATE INDEX IF NOT EXISTS idx_game_states_room ON game_states(room_code, round_number);
CREATE INDEX IF NOT EXISTS idx_vote_predictions_room ON vote_predictions(room_code, predictor_id, round_number);

-- ==========================================
-- 9. 更新时间触发器
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 10. 初始化完成
-- ==========================================
-- Schema 创建完成！
-- 接下来需要配置 Row Level Security (RLS) 策略


