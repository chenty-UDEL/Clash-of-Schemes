#!/usr/bin/env node

/**
 * 更新后自动执行的脚本
 * 在每次代码更新完成后自动提交和推送
 */

const { execSync } = require('child_process');
const path = require('path');

// 执行自动提交脚本
const autoCommitScript = path.join(__dirname, 'auto-commit.js');

try {
  console.log('\n🔄 检测到更新完成，开始自动提交...\n');
  execSync(`node ${autoCommitScript}`, { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (error) {
  console.log('\n⚠️  自动提交失败，请手动提交更改');
  console.log('运行: npm run auto-commit');
}

