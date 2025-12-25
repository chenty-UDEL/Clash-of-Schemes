#!/usr/bin/env node

/**
 * 简单的 Git 提交和推送脚本
 * 每次更新完成后自动执行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf-8', 
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      ...options 
    });
  } catch (error) {
    if (options.ignoreError) {
      return '';
    }
    throw error;
  }
}

function main() {
  console.log('🚀 开始 Git 提交和推送...\n');

  // 1. 检查是否在 Git 仓库中，如果不是则初始化
  try {
    exec('git rev-parse --git-dir', { stdio: 'pipe' });
  } catch {
    console.log('📦 初始化 Git 仓库...');
    exec('git init');
    exec('git branch -M main');
    console.log('✅ Git 仓库已初始化\n');
  }

  // 2. 创建部署触发文件（确保 Vercel 检测到更改）
  const fs = require('fs');
  const triggerFile = path.join(__dirname, '..', 'public', '.vercel-deploy');
  const triggerTimestamp = new Date().toISOString();
  fs.writeFileSync(triggerFile, `deploy\n${triggerTimestamp}\n`);
  console.log('📌 更新部署触发文件...');

  // 3. 添加所有文件
  console.log('📝 添加所有文件...');
  exec('git add .');

  // 4. 提交更改
  const timestamp = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const commitMessage = `chore: 自动更新 - ${timestamp}`;
  console.log(`💾 提交更改: ${commitMessage}`);
  exec(`git commit -m "${commitMessage}"`);

  // 5. 检查是否有远程仓库
  let hasRemote = false;
  try {
    exec('git remote get-url origin', { stdio: 'pipe' });
    hasRemote = true;
  } catch {
    console.log('\n⚠️  未配置远程仓库');
    console.log('请先配置 GitHub 远程仓库:');
    console.log('  git remote add origin <你的仓库URL>');
    console.log('  git push -u origin main');
    return;
  }

  // 6. 推送到远程
  console.log('📤 推送到远程仓库...');
  try {
    exec('git push origin main');
    console.log('\n✅ 代码已成功推送到 GitHub');
    console.log('🔗 Vercel 应该会自动检测并部署更新');
    console.log('\n⚠️  如果 Vercel 没有自动更新，请：');
    console.log('1. 在 Vercel Dashboard 手动点击 "Redeploy"');
    console.log('2. 或检查 Vercel 项目设置中的 GitHub 连接');
    console.log('3. 或运行: npm run deploy (需要先 vercel login)');
  } catch (error) {
    console.log('\n❌ 推送失败，请检查 Git 配置');
    console.log('你可以稍后手动推送: git push origin main');
  }
}

main();

