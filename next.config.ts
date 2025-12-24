/** @type {import('next').NextConfig} */
const nextConfig = {
  // 完整版：启用类型检查，提高代码质量
  typescript: {
    ignoreBuildErrors: false, // 改为false，确保类型安全
  },
  // 注意：Next.js 16+ 不再支持在 next.config.ts 中配置 eslint
  // eslint 配置应该在 eslint.config.mjs 中
};

export default nextConfig;


