#!/usr/bin/env node

/**
 * 自动提交和推送代码
 * 在每次更新完成后自动执行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf-8', 
      stdio: 'inherit',
      ...options 
    });
  } catch (error) {
    if (options.ignoreError) {
      return '';
    }
    throw error;
  }
}

function checkGitRepo() {
  try {
    exec('git rev-parse --git-dir', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function hasChanges() {
  try {
    const status = exec('git status --porcelain', { encoding: 'utf-8', stdio: 'pipe' });
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

function hasRemote() {
  try {
    exec('git remote get-url origin', { encoding: 'utf-8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getCommitMessage() {
  const timestamp = new Date().toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // 读取 package.json 获取版本号
  try {
    const packageJson = require(path.join(__dirname, '..', 'package.json'));
    return `chore: 自动更新 v${packageJson.version} - ${timestamp}`;
  } catch {
    return `chore: 自动更新 - ${timestamp}`;
  }
}

function main() {
  console.log('🚀 开始自动提交和推送...\n');

  // 1. 检查是否在 Git 仓库中
  if (!checkGitRepo()) {
    console.log('📦 初始化 Git 仓库...');
    exec('git init');
    exec('git branch -M main');
    console.log('✅ Git 仓库已初始化\n');
  }

  // 2. 创建/更新部署触发文件（强制触发 Vercel 重新部署）
  const fs = require('fs');
  const triggerFile = path.join(__dirname, '..', '.vercel-deploy-trigger');
  const timestamp = new Date().toISOString();
  fs.writeFileSync(triggerFile, `# Vercel 部署触发文件\n# 更新时间: ${timestamp}\n# 此文件用于强制触发 Vercel 重新部署\n`);
  console.log('📌 更新部署触发文件...');

  // 3. 检查是否有更改（包括触发文件）
  if (!hasChanges()) {
    // 即使没有其他更改，也提交触发文件
    console.log('📝 添加部署触发文件...');
    exec('git add .vercel-deploy-trigger');
  } else {
    console.log('📝 发现未提交的更改，正在添加...');
    exec('git add .');
  }

  // 3. 提交更改
  const commitMessage = getCommitMessage();
  console.log(`💾 提交更改: ${commitMessage}`);
  exec(`git commit -m "${commitMessage}"`);

  // 4. 检查是否有远程仓库
  if (!hasRemote()) {
    console.log('\n⚠️  未配置远程仓库');
    console.log('请先配置 GitHub 远程仓库:');
    console.log('  git remote add origin <你的仓库URL>');
    console.log('  git push -u origin main');
    return;
  }

  // 5. 推送到远程
  console.log('📤 推送到远程仓库...');
  try {
    exec('git push origin main');
    console.log('\n✅ 代码已成功推送到 GitHub');
    console.log('🔗 Vercel 将自动检测并部署更新');
  } catch (error) {
    console.log('\n❌ 推送失败，请检查 Git 配置');
    console.log('你可以稍后手动推送: git push origin main');
  }
}

main();

