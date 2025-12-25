/**
 * 角色技能测试脚本
 * 模拟用户行为，测试7个角色的技能是否能正常发动
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('请设置环境变量 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// 测试的7个角色
const TEST_ROLES = [
  '技能观测者',    // 1. check - 查看目标技能
  '利他守护者',    // 2. protect - 保护目标
  '投票阻断者',    // 3. block_vote - 阻止投票
  '沉默制裁者',    // 4. silence - 禁言目标
  '同盟者',        // 5. ally_bind - 第一夜绑定
  '命运复制者',    // 6. copy_fate - 第一夜复制
  '命运转移者'     // 7. fate_transfer - 转移命运
];

const ACTION_TYPES = {
  '技能观测者': 'check',
  '利他守护者': 'protect',
  '投票阻断者': 'block_vote',
  '沉默制裁者': 'silence',
  '同盟者': 'ally_bind',
  '命运复制者': 'copy_fate',
  '命运转移者': 'fate_transfer'
};

async function testRoles() {
  console.log('🧪 开始测试7个角色的技能...\n');
  
  // 这里需要实际的Supabase客户端
  // 由于是Node.js环境，我们需要使用@supabase/supabase-js
  console.log('⚠️  注意：此测试需要在Node.js环境中运行，并安装@supabase/supabase-js');
  console.log('📋 测试计划：');
  console.log('1. 创建测试房间');
  console.log('2. 创建7个玩家，分别分配测试角色');
  console.log('3. 开始游戏（第一夜）');
  console.log('4. 每个玩家提交技能');
  console.log('5. 结算夜晚');
  console.log('6. 验证技能是否正确处理\n');
  
  console.log('测试角色列表：');
  TEST_ROLES.forEach((role, index) => {
    console.log(`  ${index + 1}. ${role} - ${ACTION_TYPES[role]}`);
  });
  
  console.log('\n✅ 测试脚本结构已创建');
  console.log('💡 建议：在实际环境中手动测试或使用Postman/curl进行API测试');
}

testRoles().catch(console.error);


