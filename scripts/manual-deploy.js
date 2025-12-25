#!/usr/bin/env node

/**
 * 手动部署到 Vercel
 * 用于强制触发 Vercel 部署
 */

const { execSync } = require('child_process');
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
  console.log('🚀 开始手动部署到 Vercel...\n');

  // 检查是否安装了 Vercel CLI
  try {
    exec('vercel --version', { stdio: 'pipe' });
  } catch {
    console.log('📦 安装 Vercel CLI...');
    exec('npm install -g vercel');
  }

  // 构建项目
  console.log('\n📦 构建项目...');
  try {
    exec('npm run build');
    console.log('✅ 构建成功\n');
  } catch (error) {
    console.log('❌ 构建失败，但继续部署...\n');
  }

  // 部署到生产环境
  console.log('🚀 部署到 Vercel 生产环境...');
  try {
    exec('vercel --prod --yes');
    console.log('\n✅ 部署成功！');
    console.log('🔗 请访问 Vercel Dashboard 查看部署状态');
  } catch (error) {
    console.log('\n❌ 部署失败');
    console.log('请检查：');
    console.log('1. 是否已登录 Vercel: vercel login');
    console.log('2. 是否已链接项目: vercel link');
    console.log('3. 环境变量是否已配置');
    process.exit(1);
  }
}

main();

