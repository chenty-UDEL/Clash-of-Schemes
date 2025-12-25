-- ==========================================
-- Row Level Security (RLS) 策略
-- ==========================================
-- 说明: 配置数据库访问权限，确保数据安全

-- ==========================================
-- 1. 启用 RLS
-- ==========================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE night_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_predictions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. 房间表策略
-- ==========================================
-- 所有人可以读取房间信息
CREATE POLICY "Anyone can read rooms"
    ON rooms FOR SELECT
    USING (true);

-- 只有服务端可以创建/更新房间
CREATE POLICY "Service role can manage rooms"
    ON rooms FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- 3. 玩家表策略
-- ==========================================
-- 所有人可以读取玩家信息（同一房间）
CREATE POLICY "Anyone can read players in same room"
    ON players FOR SELECT
    USING (true);

-- 只有服务端可以创建/更新玩家
CREATE POLICY "Service role can manage players"
    ON players FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- 4. 投票表策略
-- ==========================================
-- 所有人可以读取投票（同一房间）
CREATE POLICY "Anyone can read votes in same room"
    ON votes FOR SELECT
    USING (true);

-- 只有服务端可以创建/更新投票
CREATE POLICY "Service role can manage votes"
    ON votes FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- 5. 夜晚行动表策略
-- ==========================================
-- 所有人可以读取行动（同一房间）
CREATE POLICY "Anyone can read night actions in same room"
    ON night_actions FOR SELECT
    USING (true);

-- 只有服务端可以创建/更新行动
CREATE POLICY "Service role can manage night actions"
    ON night_actions FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- 6. 游戏日志表策略
-- ==========================================
-- 所有人可以读取日志（同一房间）
-- 注意：viewer_ids 字段用于控制可见性，在应用层处理
CREATE POLICY "Anyone can read game logs in same room"
    ON game_logs FOR SELECT
    USING (true);

-- 只有服务端可以创建日志
CREATE POLICY "Service role can create game logs"
    ON game_logs FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- ==========================================
-- 7. 游戏状态表策略
-- ==========================================
-- 只有服务端可以访问
CREATE POLICY "Service role can manage game states"
    ON game_states FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- 8. 投票预测表策略
-- ==========================================
-- 只有服务端可以访问
CREATE POLICY "Service role can manage vote predictions"
    ON vote_predictions FOR ALL
    USING (auth.role() = 'service_role');

-- ==========================================
-- 注意：
-- ==========================================
-- 1. 这些策略假设使用 Supabase Service Role Key 进行服务端操作
-- 2. 客户端使用 Anon Key，只能读取数据
-- 3. 所有写操作（创建、更新、删除）都通过 API 路由处理
-- 4. API 路由使用 Service Role Key，可以绕过 RLS



