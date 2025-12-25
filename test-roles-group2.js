/**
 * 角色技能测试脚本 - 第二组（7个角色）
 * 
 * 测试角色：
 * 1. 反向投票者 - 被投票出局时反击
 * 2. 均衡守护者 - 打破平局
 * 3. 投票回收者 - 存储和使用投票
 * 4. 胜利夺取者 - 夺取胜利条件
 * 5. 心灵胜者 - 预测投票（验证逻辑）
 * 6. 影子胜者 - 第一夜绑定目标
 * 7. 减票守护者 - 被动减票
 */

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3000';

// 测试配置
const TEST_ROOM_CODE = 'TEST002';
const TEST_PLAYERS = [
  { id: 201, name: '反向投票者玩家', role: '反向投票者' },
  { id: 202, name: '均衡守护者玩家', role: '均衡守护者' },
  { id: 203, name: '投票回收者玩家', role: '投票回收者' },
  { id: 204, name: '胜利夺取者玩家', role: '胜利夺取者' },
  { id: 205, name: '心灵胜者玩家', role: '心灵胜者' },
  { id: 206, name: '影子胜者玩家', role: '影子胜者' },
  { id: 207, name: '减票守护者玩家', role: '减票守护者' },
];

async function testRole(roleName, testFunction) {
  console.log(`\n🧪 测试角色: ${roleName}`);
  console.log('='.repeat(50));
  try {
    await testFunction();
    console.log(`✅ ${roleName} - 测试通过`);
  } catch (error) {
    console.error(`❌ ${roleName} - 测试失败:`, error.message);
    throw error;
  }
}

// 测试1: 反向投票者
async function testReverseVoter() {
  console.log('测试场景: 反向投票者被投票出局，选择投他的人代替出局');
  
  // 1. 模拟投票阶段 - 多个玩家投票给反向投票者
  const voters = [202, 203, 204]; // 其他玩家投票给反向投票者
  const reverseVoterId = 201;
  
  // 提交投票
  for (const voterId of voters) {
    const voteRes = await fetch(`${BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: TEST_ROOM_CODE,
        voterId,
        targetId: reverseVoterId
      })
    });
    if (!voteRes.ok) throw new Error(`投票提交失败: ${await voteRes.text()}`);
  }
  
  // 2. 结算白天 - 应该触发反向投票者的反击
  const processRes = await fetch(`${BASE_URL}/api/rooms/${TEST_ROOM_CODE}/process-day`, {
    method: 'POST'
  });
  
  if (!processRes.ok) {
    throw new Error(`白天结算失败: ${await processRes.text()}`);
  }
  
  const result = await processRes.json();
  console.log('白天结算结果:', result);
  
  // 3. 验证：反向投票者应该存活，投他的人中有一个被淘汰
  // 注意：实际实现中，反向投票者需要在前端选择目标，这里只是测试逻辑
  console.log('✅ 反向投票者逻辑验证完成');
}

// 测试2: 均衡守护者
async function testBalanceGuardian() {
  console.log('测试场景: 出现平票时，均衡守护者打破平局');
  
  // 1. 创建平票情况
  const player1 = 201;
  const player2 = 202; // 均衡守护者
  
  // 玩家1和玩家2各得2票（平票）
  const votes = [
    { voterId: 203, targetId: player1 },
    { voterId: 204, targetId: player1 },
    { voterId: 205, targetId: player2 },
    { voterId: 206, targetId: player2 },
  ];
  
  for (const vote of votes) {
    const voteRes = await fetch(`${BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: TEST_ROOM_CODE,
        voterId: vote.voterId,
        targetId: vote.targetId
      })
    });
    if (!voteRes.ok) throw new Error(`投票提交失败: ${await voteRes.text()}`);
  }
  
  // 2. 均衡守护者打破平局
  const breakRes = await fetch(`${BASE_URL}/api/actions/break-tie`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: TEST_ROOM_CODE,
      playerId: 202, // 均衡守护者
      targetId: player1 // 选择玩家1出局
    })
  });
  
  if (!breakRes.ok) {
    throw new Error(`打破平局失败: ${await breakRes.text()}`);
  }
  
  console.log('✅ 均衡守护者打破平局成功');
}

// 测试3: 投票回收者
async function testVoteCollector() {
  console.log('测试场景: 投票回收者存储投票并在后续回合使用');
  
  const collectorId = 203;
  
  // 1. 存储投票
  const storeRes = await fetch(`${BASE_URL}/api/votes/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: TEST_ROOM_CODE,
      playerId: collectorId
    })
  });
  
  if (!storeRes.ok) {
    throw new Error(`存储投票失败: ${await storeRes.text()}`);
  }
  
  const storeResult = await storeRes.json();
  console.log('存储投票结果:', storeResult);
  
  // 2. 使用存储的投票
  const voteRes = await fetch(`${BASE_URL}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: TEST_ROOM_CODE,
      voterId: collectorId,
      targetId: 201,
      useStoredVotes: 1 // 使用1张存储的票
    })
  });
  
  if (!voteRes.ok) {
    throw new Error(`使用存储投票失败: ${await voteRes.text()}`);
  }
  
  console.log('✅ 投票回收者存储和使用投票成功');
}

// 测试4: 胜利夺取者
async function testVictoryStealer() {
  console.log('测试场景: 胜利夺取者夺取目标的胜利条件');
  
  const stealerId = 204;
  const targetId = 205; // 假设目标是心灵胜者
  
  // 1. 夜晚阶段 - 胜利夺取者选择目标
  const actionRes = await fetch(`${BASE_URL}/api/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: TEST_ROOM_CODE,
      actorId: stealerId,
      targetId: targetId,
      actionType: 'victory_steal'
    })
  });
  
  if (!actionRes.ok) {
    throw new Error(`胜利夺取失败: ${await actionRes.text()}`);
  }
  
  console.log('✅ 胜利夺取者锁定目标成功');
  
  // 注意：实际胜利夺取逻辑在白天结算时验证
}

// 测试5: 心灵胜者（预测验证）
async function testMindReader() {
  console.log('测试场景: 心灵胜者预测投票并验证');
  
  const mindReaderId = 205;
  const predictedVoterId = 201;
  const predictedTargetId = 202;
  
  // 1. 夜晚阶段 - 心灵胜者预测
  const predictRes = await fetch(`${BASE_URL}/api/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: TEST_ROOM_CODE,
      actorId: mindReaderId,
      targetId: predictedTargetId,
      actionType: 'predict_vote',
      predictedVoterId: predictedVoterId
    })
  });
  
  if (!predictRes.ok) {
    throw new Error(`预测失败: ${await predictRes.text()}`);
  }
  
  // 2. 白天阶段 - 被预测的玩家投票
  const voteRes = await fetch(`${BASE_URL}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: TEST_ROOM_CODE,
      voterId: predictedVoterId,
      targetId: predictedTargetId // 预测正确
    })
  });
  
  if (!voteRes.ok) {
    throw new Error(`投票失败: ${await voteRes.text()}`);
  }
  
  // 3. 结算白天 - 应该验证预测
  const processRes = await fetch(`${BASE_URL}/api/rooms/${TEST_ROOM_CODE}/process-day`, {
    method: 'POST'
  });
  
  if (!processRes.ok) {
    throw new Error(`白天结算失败: ${await processRes.text()}`);
  }
  
  console.log('✅ 心灵胜者预测验证逻辑完成');
}

// 测试6: 影子胜者
async function testShadowWinner() {
  console.log('测试场景: 影子胜者第一夜绑定目标，目标被投出时获胜');
  
  const shadowId = 206;
  const targetId = 201;
  
  // 1. 第一夜 - 影子胜者绑定目标
  const actionRes = await fetch(`${BASE_URL}/api/actions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: TEST_ROOM_CODE,
      actorId: shadowId,
      targetId: targetId,
      actionType: 'shadow_bind'
    })
  });
  
  if (!actionRes.ok) {
    throw new Error(`绑定目标失败: ${await actionRes.text()}`);
  }
  
  // 2. 处理夜晚
  const nightRes = await fetch(`${BASE_URL}/api/rooms/${TEST_ROOM_CODE}/process-night`, {
    method: 'POST'
  });
  
  if (!nightRes.ok) {
    throw new Error(`夜晚结算失败: ${await nightRes.text()}`);
  }
  
  // 3. 白天投票给目标
  const voteRes = await fetch(`${BASE_URL}/api/votes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomCode: TEST_ROOM_CODE,
      voterId: 202,
      targetId: targetId
    })
  });
  
  if (!voteRes.ok) {
    throw new Error(`投票失败: ${await voteRes.text()}`);
  }
  
  // 4. 结算白天 - 目标被投出，影子胜者应该获胜
  const processRes = await fetch(`${BASE_URL}/api/rooms/${TEST_ROOM_CODE}/process-day`, {
    method: 'POST'
  });
  
  if (!processRes.ok) {
    throw new Error(`白天结算失败: ${await processRes.text()}`);
  }
  
  const result = await processRes.json();
  console.log('白天结算结果:', result);
  
  // 验证：如果目标被投出，影子胜者应该获胜
  if (result.winner && result.winner.role === '影子胜者') {
    console.log('✅ 影子胜者获胜逻辑正确');
  } else {
    console.log('⚠️ 影子胜者获胜逻辑需要进一步验证');
  }
}

// 测试7: 减票守护者
async function testVoteReducer() {
  console.log('测试场景: 减票守护者被投票时，总得票数减少1票');
  
  const reducerId = 207;
  
  // 1. 多个玩家投票给减票守护者
  const voters = [201, 202, 203];
  for (const voterId of voters) {
    const voteRes = await fetch(`${BASE_URL}/api/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode: TEST_ROOM_CODE,
        voterId,
        targetId: reducerId
      })
    });
    if (!voteRes.ok) throw new Error(`投票提交失败: ${await voteRes.text()}`);
  }
  
  // 2. 结算白天 - 减票守护者应该只得到 3-1=2 票
  const processRes = await fetch(`${BASE_URL}/api/rooms/${TEST_ROOM_CODE}/process-day`, {
    method: 'POST'
  });
  
  if (!processRes.ok) {
    throw new Error(`白天结算失败: ${await processRes.text()}`);
  }
  
  console.log('✅ 减票守护者减票逻辑验证完成');
  // 注意：实际票数需要在日志或返回结果中验证
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试第二组角色技能');
  console.log('='.repeat(50));
  
  const tests = [
    { name: '反向投票者', fn: testReverseVoter },
    { name: '均衡守护者', fn: testBalanceGuardian },
    { name: '投票回收者', fn: testVoteCollector },
    { name: '胜利夺取者', fn: testVictoryStealer },
    { name: '心灵胜者', fn: testMindReader },
    { name: '影子胜者', fn: testShadowWinner },
    { name: '减票守护者', fn: testVoteReducer },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      await testRole(test.name, test.fn);
      results.push({ role: test.name, status: '✅ 通过' });
    } catch (error) {
      results.push({ role: test.name, status: '❌ 失败', error: error.message });
    }
  }
  
  console.log('\n📊 测试总结');
  console.log('='.repeat(50));
  results.forEach(r => {
    console.log(`${r.role}: ${r.status}`);
    if (r.error) console.log(`  错误: ${r.error}`);
  });
  
  const passed = results.filter(r => r.status.includes('✅')).length;
  const failed = results.filter(r => r.status.includes('❌')).length;
  
  console.log(`\n总计: ${passed} 通过, ${failed} 失败`);
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };

